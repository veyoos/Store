<?php
session_start();
require_once __DIR__ . '/../config.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

$db = get_db();
$msg = '';
$msgType = 'success';

// ساخت خودکار ستون‌های دیتابیس در صورت عدم وجود (Migration بدون نیاز به اجرای دستی SQL)
if ($db) {
    try { $db->exec("ALTER TABLE products ADD COLUMN front_image VARCHAR(500) DEFAULT '' AFTER description"); } catch (Exception $e) {}
    try { $db->exec("ALTER TABLE products ADD COLUMN side_image VARCHAR(500) DEFAULT '' AFTER front_image"); } catch (Exception $e) {}
    try { $db->exec("ALTER TABLE products ADD COLUMN back_image VARCHAR(500) DEFAULT '' AFTER side_image"); } catch (Exception $e) {}
    try { $db->exec("ALTER TABLE products ADD COLUMN sizes VARCHAR(255) DEFAULT 'S,M,L,XL,XXL' AFTER color"); } catch (Exception $e) {}
    try { $db->exec("ALTER TABLE products ADD COLUMN colourways LONGTEXT AFTER sizes"); } catch (Exception $e) {}
    try { $db->exec("ALTER TABLE orders ADD COLUMN selected_color VARCHAR(100) DEFAULT '' AFTER customer_address"); } catch (Exception $e) {}
    try { $db->exec("ALTER TABLE orders ADD COLUMN selected_size VARCHAR(50) DEFAULT '' AFTER selected_color"); } catch (Exception $e) {}
}

// تابع کمکی برای آپلود ایمن تصاویر محصولات
function handle_single_upload($fileInputName, $prefix = 'product') {
    if (empty($_FILES[$fileInputName]['name']) || $_FILES[$fileInputName]['error'] !== UPLOAD_ERR_OK) {
        return '';
    }
    $tmpName  = $_FILES[$fileInputName]['tmp_name'];
    $origName = $_FILES[$fileInputName]['name'];
    $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    $allowed  = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    
    if (!in_array($ext, $allowed)) {
        return '';
    }
    
    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }
    
    $safePrefix = preg_replace('/[^a-z0-9\-]/i', '', $prefix) ?: 'product';
    $fileName = $safePrefix . '-' . time() . '-' . rand(100, 999) . '.' . $ext;
    $targetPath = $uploadDir . $fileName;
    
    if (move_uploaded_file($tmpName, $targetPath)) {
        return 'uploads/' . $fileName;
    }
    return '';
}

function delete_uploaded_file($relativePath) {
    if (empty($relativePath) || !is_string($relativePath)) return;
    $relativePath = ltrim($relativePath, '/');
    if (strpos($relativePath, 'uploads/') !== false) {
        $sub = substr($relativePath, strpos($relativePath, 'uploads/'));
        $siteRoot = realpath(__DIR__ . '/..');
        $fullPath = realpath($siteRoot . '/' . $sub);
        $baseUploadDir = realpath($siteRoot . '/uploads');
        if ($fullPath && $baseUploadDir && strpos($fullPath, $baseUploadDir) === 0 && is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}

// پردازش فرم‌ها
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // ۱. افزودن محصول جدید
    if ($action === 'add_product' && $db) {
        $title       = trim($_POST['title'] ?? '');
        $titleFa     = trim($_POST['title_fa'] ?? '');
        $slug        = trim($_POST['slug'] ?? '');
        $price       = (int)($_POST['price'] ?? 0);
        $currency    = trim($_POST['currency'] ?? 'تومان');
        $color       = trim($_POST['color'] ?? '');
        $isAvailable = isset($_POST['is_available']) ? 1 : 0;
        $stock       = (int)($_POST['stock_quantity'] ?? 10);
        $buyUrl      = trim($_POST['buy_url'] ?? '');
        $description = trim($_POST['description'] ?? '');

        // سایزها
        $sizesArray = $_POST['sizes'] ?? ['S', 'M', 'L', 'XL', 'XXL'];
        $sizesStr = is_array($sizesArray) ? implode(',', array_filter($sizesArray)) : 'S,M,L,XL,XXL';

        if (empty($title)) {
            $msg = 'وارد کردن عنوان انگلیسی یا شناسه محصول الزامی است.';
            $msgType = 'error';
        } else {
            if (empty($slug)) {
                $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $title));
                $slug = trim($slug, '-');
                if (empty($slug)) {
                    $slug = 'product-' . time();
                }
            }

            // بررسی عدم تکراری بودن اسلاگ
            $stmtCheck = $db->prepare("SELECT id FROM products WHERE slug = ?");
            $stmtCheck->execute([$slug]);
            if ($stmtCheck->fetch()) {
                $slug .= '-' . rand(100, 999);
            }

            // آپلود تصاویر سه‌گانه
            $sideImage  = handle_single_upload('product_image_side', $slug . '-side');
            $frontImage = handle_single_upload('product_image_front', $slug . '-front');
            $backImage  = handle_single_upload('product_image_back', $slug . '-back');

            // پشتیبانی تک‌عکسه (اگر فقط یکی آپلود شد)
            if (empty($frontImage) && !empty($sideImage)) $frontImage = $sideImage;
            if (empty($sideImage) && !empty($frontImage)) $sideImage = $frontImage;

            // رنگ‌بندی‌های دیگر (Colourways)
            $cwList = [];
            if (!empty($_POST['cw_label']) && is_array($_POST['cw_label'])) {
                $uploadDir = __DIR__ . '/../uploads/';
                foreach ($_POST['cw_label'] as $k => $cwLabel) {
                    $cwLabel = trim($cwLabel);
                    if ($cwLabel === '') continue;
                    $cwHex = trim($_POST['cw_hex'][$k] ?? '#ffffff');
                    
                    $cwFront = '';
                    if (!empty($_FILES['cw_front_file']['name'][$k]) && $_FILES['cw_front_file']['error'][$k] === UPLOAD_ERR_OK) {
                        $ext = strtolower(pathinfo($_FILES['cw_front_file']['name'][$k], PATHINFO_EXTENSION));
                        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                            $cwFname = 'cw-' . $slug . '-' . $k . '-f-' . time() . '.' . $ext;
                            if (move_uploaded_file($_FILES['cw_front_file']['tmp_name'][$k], $uploadDir . $cwFname)) {
                                $cwFront = 'uploads/' . $cwFname;
                            }
                        }
                    }

                    $cwSide = '';
                    if (!empty($_FILES['cw_side_file']['name'][$k]) && $_FILES['cw_side_file']['error'][$k] === UPLOAD_ERR_OK) {
                        $ext = strtolower(pathinfo($_FILES['cw_side_file']['name'][$k], PATHINFO_EXTENSION));
                        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                            $cwSname = 'cw-' . $slug . '-' . $k . '-s-' . time() . '.' . $ext;
                            if (move_uploaded_file($_FILES['cw_side_file']['tmp_name'][$k], $uploadDir . $cwSname)) {
                                $cwSide = 'uploads/' . $cwSname;
                            }
                        }
                    }

                    $cwBack = '';
                    if (!empty($_FILES['cw_back_file']['name'][$k]) && $_FILES['cw_back_file']['error'][$k] === UPLOAD_ERR_OK) {
                        $ext = strtolower(pathinfo($_FILES['cw_back_file']['name'][$k], PATHINFO_EXTENSION));
                        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                            $cwBname = 'cw-' . $slug . '-' . $k . '-b-' . time() . '.' . $ext;
                            if (move_uploaded_file($_FILES['cw_back_file']['tmp_name'][$k], $uploadDir . $cwBname)) {
                                $cwBack = 'uploads/' . $cwBname;
                            }
                        }
                    }

                    $cwList[] = [
                        'label' => $cwLabel,
                        'hex'   => $cwHex,
                        'front' => $cwFront ?: $frontImage,
                        'side'  => $cwSide ?: $sideImage,
                        'back'  => $cwBack ?: ($backImage ?: '')
                    ];
                }
            }
            $colourwaysJson = !empty($cwList) ? json_encode($cwList, JSON_UNESCAPED_UNICODE) : '';

            try {
                $stmt = $db->prepare("INSERT INTO products (slug, title, title_fa, price, currency, is_available, stock_quantity, color, sizes, colourways, buy_url, description, front_image, side_image, back_image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 99)");
                $stmt->execute([$slug, $title, $titleFa, $price, $currency, $isAvailable, $stock, $color, $sizesStr, $colourwaysJson, $buyUrl, $description, $frontImage, $sideImage, $backImage]);
                $msg = 'محصول جدید با موفقیت اضافه شد!';
                $msgType = 'success';
            } catch (Exception $e) {
                $msg = 'خطا در ثبت محصول: ' . $e->getMessage();
                $msgType = 'error';
            }
        }
    }

    // ۲. ویرایش محصول
    if ($action === 'edit_product' && $db) {
        $id          = (int)$_POST['id'];
        $title       = trim($_POST['title'] ?? '');
        $titleFa     = trim($_POST['title_fa'] ?? '');
        $price       = (int)$_POST['price'];
        $currency    = trim($_POST['currency'] ?? 'تومان');
        $color       = trim($_POST['color'] ?? '');
        $isAvailable = isset($_POST['is_available']) ? 1 : 0;
        $stock       = (int)$_POST['stock_quantity'];
        $buyUrl      = trim($_POST['buy_url'] ?? '');
        $description = trim($_POST['description'] ?? '');

        $sizesArray = $_POST['sizes'] ?? [];
        $sizesStr = !empty($sizesArray) && is_array($sizesArray) ? implode(',', array_filter($sizesArray)) : 'S,M,L,XL,XXL';

        // آپلود تصاویر جدید در صورت ارسال
        $newSide  = handle_single_upload('product_image_side', 'p-' . $id . '-side');
        $newFront = handle_single_upload('product_image_front', 'p-' . $id . '-front');
        $newBack  = handle_single_upload('product_image_back', 'p-' . $id . '-back');

        // پردازش رنگ‌بندی‌های جدید
        $cwList = [];
        if (!empty($_POST['cw_label']) && is_array($_POST['cw_label'])) {
            $uploadDir = __DIR__ . '/../uploads/';
            foreach ($_POST['cw_label'] as $k => $cwLabel) {
                $cwLabel = trim($cwLabel);
                if ($cwLabel === '') continue;
                $cwHex = trim($_POST['cw_hex'][$k] ?? '#ffffff');

                $cwFront = trim($_POST['cw_existing_front'][$k] ?? '');
                if (!empty($_FILES['cw_front_file']['name'][$k]) && $_FILES['cw_front_file']['error'][$k] === UPLOAD_ERR_OK) {
                    $ext = strtolower(pathinfo($_FILES['cw_front_file']['name'][$k], PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                        $cwFname = 'cw-p' . $id . '-' . $k . '-f-' . time() . '.' . $ext;
                        if (move_uploaded_file($_FILES['cw_front_file']['tmp_name'][$k], $uploadDir . $cwFname)) {
                            $cwFront = 'uploads/' . $cwFname;
                        }
                    }
                }

                $cwSide = trim($_POST['cw_existing_side'][$k] ?? '');
                if (!empty($_FILES['cw_side_file']['name'][$k]) && $_FILES['cw_side_file']['error'][$k] === UPLOAD_ERR_OK) {
                    $ext = strtolower(pathinfo($_FILES['cw_side_file']['name'][$k], PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                        $cwSname = 'cw-p' . $id . '-' . $k . '-s-' . time() . '.' . $ext;
                        if (move_uploaded_file($_FILES['cw_side_file']['tmp_name'][$k], $uploadDir . $cwSname)) {
                            $cwSide = 'uploads/' . $cwSname;
                        }
                    }
                }

                $cwBack = trim($_POST['cw_existing_back'][$k] ?? '');
                if (!empty($_FILES['cw_back_file']['name'][$k]) && $_FILES['cw_back_file']['error'][$k] === UPLOAD_ERR_OK) {
                    $ext = strtolower(pathinfo($_FILES['cw_back_file']['name'][$k], PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                        $cwBname = 'cw-p' . $id . '-' . $k . '-b-' . time() . '.' . $ext;
                        if (move_uploaded_file($_FILES['cw_back_file']['tmp_name'][$k], $uploadDir . $cwBname)) {
                            $cwBack = 'uploads/' . $cwBname;
                        }
                    }
                }

                $cwList[] = [
                    'label' => $cwLabel,
                    'hex'   => $cwHex,
                    'front' => $cwFront,
                    'side'  => $cwSide,
                    'back'  => $cwBack
                ];
            }
        }
        $colourwaysJson = !empty($cwList) ? json_encode($cwList, JSON_UNESCAPED_UNICODE) : '';

        try {
            $sql = "UPDATE products SET title = ?, title_fa = ?, price = ?, currency = ?, color = ?, sizes = ?, is_available = ?, stock_quantity = ?, buy_url = ?, description = ?";
            $params = [$title, $titleFa, $price, $currency, $color, $sizesStr, $isAvailable, $stock, $buyUrl, $description];

            if ($colourwaysJson !== '') {
                $sql .= ", colourways = ?";
                $params[] = $colourwaysJson;
            }
            if (!empty($newFront)) {
                $sql .= ", front_image = ?";
                $params[] = $newFront;
            }
            if (!empty($newSide)) {
                $sql .= ", side_image = ?";
                $params[] = $newSide;
            }
            if (!empty($newBack)) {
                $sql .= ", back_image = ?";
                $params[] = $newBack;
            }

            $sql .= " WHERE id = ?";
            $params[] = $id;

            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            $msg = 'محصول با موفقیت به‌روزرسانی شد.';
            $msgType = 'success';
        } catch (Exception $e) {
            $msg = 'خطا در ویرایش محصول: ' . $e->getMessage();
            $msgType = 'error';
        }
    }

    // ۳. حذف محصول و پاکسازی تمام عکس‌های آن از روی سرور
    if ($action === 'delete_product' && $db) {
        $id = (int)$_POST['id'];
        try {
            // دریافت مشخصات تصاویر محصول قبل از حذف رکورد دیتابیس
            $stmt = $db->prepare("SELECT front_image, side_image, back_image, colourways FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $prod = $stmt->fetch();

            if ($prod) {
                delete_uploaded_file($prod['front_image'] ?? '');
                delete_uploaded_file($prod['side_image'] ?? '');
                delete_uploaded_file($prod['back_image'] ?? '');

                if (!empty($prod['colourways'])) {
                    $cws = is_array($prod['colourways']) ? $prod['colourways'] : json_decode($prod['colourways'], true);
                    if (is_array($cws)) {
                        foreach ($cws as $cw) {
                            if (is_array($cw)) {
                                delete_uploaded_file($cw['front'] ?? '');
                                delete_uploaded_file($cw['side'] ?? '');
                                delete_uploaded_file($cw['back'] ?? '');
                            }
                        }
                    }
                }
            }

            $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $msg = 'محصول و تمامی تصاویر اختصاصی آن با موفقیت از روی هاست حذف شدند.';
            $msgType = 'success';
        } catch (Exception $e) {
            $msg = 'خطا در حذف محصول: ' . $e->getMessage();
            $msgType = 'error';
        }
    }

    // ۴. به‌روزرسانی تنظیمات
    if ($action === 'update_settings' && $db) {
        $logoUrl = trim($_POST['logo_url'] ?? '');
        $newLogo = handle_single_upload('logo_file', 'logo');
        if (!empty($newLogo)) {
            $logoUrl = $newLogo;
        }

        $settingsToUpdate = [
            'store_title'   => $_POST['store_title'] ?? '',
            'marquee_text'  => $_POST['marquee_text'] ?? '',
            'contact_phone' => $_POST['contact_phone'] ?? '',
            'instagram'     => $_POST['instagram'] ?? '',
            'telegram'      => $_POST['telegram'] ?? '',
            'logo_url'      => $logoUrl,
            'logo_height'   => $_POST['logo_height'] ?? '36',
            'logo_width'    => $_POST['logo_width'] ?? 'auto'
        ];
        try {
            $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            foreach ($settingsToUpdate as $k => $v) {
                $stmt->execute([$k, trim($v)]);
            }
            $msg = 'تنظیمات با موفقیت ذخیره شد.';
            $msgType = 'success';
        } catch (Exception $e) {
            $msg = 'خطا در ذخیره تنظیمات: ' . $e->getMessage();
            $msgType = 'error';
        }
    }

    // ۵. تغییر وضعیت سفارش
    if ($action === 'update_order_status' && $db) {
        $orderId = (int)$_POST['order_id'];
        $status  = trim($_POST['status']);
        try {
            $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$status, $orderId]);
            $msg = 'وضعیت سفارش به‌روزرسانی شد.';
            $msgType = 'success';
        } catch (Exception $e) {
            $msg = 'خطا در تغییر وضعیت سفارش: ' . $e->getMessage();
            $msgType = 'error';
        }
    }

    // ۶. حذف سفارش
    if ($action === 'delete_order' && $db) {
        $orderId = (int)$_POST['order_id'];
        try {
            $stmt = $db->prepare("DELETE FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            $msg = 'سفارش حذف شد.';
            $msgType = 'error';
        } catch (Exception $e) {
            $msg = 'خطا: ' . $e->getMessage();
            $msgType = 'error';
        }
    }
}

// دریافت داده‌ها جهت نمایش
$products = [];
$orders = [];
$settings = [
    'store_title' => 'فروشگاه رگال لباس',
    'marquee_text' => 'NEW DROPS',
    'contact_phone' => '',
    'instagram' => '',
    'telegram' => '',
    'logo_url' => '',
    'logo_height' => '36',
    'logo_width' => 'auto'
];

if ($db) {
    try {
        $stmt = $db->query("SELECT * FROM products ORDER BY sort_order ASC, id ASC");
        $products = $stmt->fetchAll();

        $stmt = $db->query("SELECT * FROM orders ORDER BY id DESC LIMIT 50");
        $orders = $stmt->fetchAll();

        $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    } catch (Exception $e) {}
}

$tab = $_GET['tab'] ?? 'products';
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مدیریت فروشگاه رگال | پنل مدیریت</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background-color: #0c0d12;
            color: #f1f5f9;
            font-family: system-ui, -apple-system, 'Vazirmatn', 'Segoe UI', Tahoma, sans-serif;
            padding-bottom: 60px;
            direction: rtl;
        }
        .container { max-width: 1240px; margin: 0 auto; padding: 20px 16px; }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: #141721;
            border-radius: 14px;
            border: 1px solid #232838;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .header-title { display: flex; align-items: center; gap: 12px; }
        .header-title h1 { font-size: 19px; font-weight: 700; color: #fff; }
        .nav-tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #232838; padding-bottom: 10px; }
        .nav-tab {
            padding: 9px 18px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            color: #94a3b8;
            background: transparent;
            transition: all 0.2s;
        }
        .nav-tab.active { background: #2563eb; color: #fff; }
        .nav-tab:hover:not(.active) { background: #1c2130; color: #f1f5f9; }

        .btn {
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 9px 16px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
        }
        .btn:hover { background: #1d4ed8; }
        .btn-green { background: #059669; }
        .btn-green:hover { background: #047857; }
        .btn-red { background: #dc2626; }
        .btn-red:hover { background: #b91c1c; }
        .btn-blue { background: #0284c7; }
        .btn-blue:hover { background: #0369a1; }
        .btn-sm { padding: 5px 10px; font-size: 12px; }

        .card {
            background: #141721;
            border: 1px solid #232838;
            border-radius: 14px;
            padding: 24px;
            margin-bottom: 24px;
        }
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
        }
        .card-title { font-size: 17px; font-weight: 700; color: #fff; margin: 0; }

        table { width: 100%; border-collapse: collapse; text-align: right; font-size: 13px; }
        th, td { padding: 13px 14px; border-bottom: 1px solid #1e2434; }
        th { color: #94a3b8; font-weight: 600; background: #181c28; }
        tr:hover td { background: #171b26; }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
        }
        .badge-green { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .badge-red { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .badge-yellow { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }

        .msg-box {
            padding: 13px 18px;
            border-radius: 10px;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .msg-success { background: #064e3b; color: #a7f3d0; border: 1px solid #059669; }
        .msg-error { background: #450a0a; color: #fca5a5; border: 1px solid #dc2626; }

        /* Modal Styles */
        .modal-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.82);
            backdrop-filter: blur(8px);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }
        .modal {
            background: #131622;
            border: 1px solid #293044;
            border-radius: 16px;
            width: 100%;
            max-width: 680px;
            max-height: 92vh;
            overflow-y: auto;
            padding: 24px;
            color: #f1f5f9;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #202638;
            padding-bottom: 12px;
        }
        .modal-close { background: none; border: none; font-size: 26px; color: #94a3b8; cursor: pointer; }
        .modal-close:hover { color: #fff; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .form-group { margin-bottom: 14px; }
        .form-group label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; font-weight: 500; }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            background: #090b10;
            border: 1px solid #282f42;
            border-radius: 8px;
            padding: 10px 12px;
            color: #fff;
            font-size: 13px;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
            outline: none; border-color: #3b82f6;
        }

        /* Checkbox Buttons */
        .size-tags-select {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .size-check-label {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #090b10;
            border: 1px solid #282f42;
            padding: 6px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            color: #cbd5e1;
        }
        .size-check-label input:checked + span { color: #38bdf8; font-weight: 700; }

        /* Colourways Section */
        .cw-container {
            background: #0a0c12;
            border: 1px solid #222838;
            border-radius: 10px;
            padding: 14px;
            margin-top: 8px;
        }
        .cw-row {
            display: grid;
            grid-template-columns: 100px 60px 1fr 1fr 1fr 40px;
            gap: 8px;
            align-items: center;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="header-title">
            <span style="font-size: 28px;">👕</span>
            <div>
                <h1>پنل مدیریت فروشگاه و رگال لباس</h1>
                <div style="font-size: 12px; color: #94a3b8;"><?= htmlspecialchars($settings['store_title']) ?></div>
            </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
            <a href="../" target="_blank" class="btn btn-blue">🌐 مشاهده فروشگاه زنده</a>
            <a href="logout.php" class="btn btn-red btn-sm">خروج</a>
        </div>
    </header>

    <?php if ($msg): ?>
        <div class="msg-box msg-<?= $msgType ?>"><?= htmlspecialchars($msg) ?></div>
    <?php endif; ?>

    <div class="nav-tabs">
        <a href="?tab=products" class="nav-tab <?= $tab === 'products' ? 'active' : '' ?>">📦 محصولات رگال (<?= count($products) ?>)</a>
        <a href="?tab=orders" class="nav-tab <?= $tab === 'orders' ? 'active' : '' ?>">🛍️ سفارشات مشتریان (<?= count($orders) ?>)</a>
        <a href="?tab=settings" class="nav-tab <?= $tab === 'settings' ? 'active' : '' ?>">⚙️ تنظیمات فروشگاه</a>
    </div>

    <?php if ($tab === 'products'): ?>
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">مدیریت محصولات رگال</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">لباس‌های جدید تعریف کنید، تصاویر از بغل/جلو/پشت را آپلود کرده و رنگ‌بندی و سایز را تعیین کنید.</div>
                </div>
                <button class="btn btn-green" onclick="openAddModal()">➕ افزودن محصول جدید</button>
            </div>

            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>تصویر</th>
                            <th>نام محصول</th>
                            <th>قیمت</th>
                            <th>رنگ اصلی</th>
                            <th>سایزها</th>
                            <th>وضعیت</th>
                            <th>موجودی</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($products as $p): ?>
                            <?php
                            $thumbSrc = '';
                            if (!empty($p['front_image'])) {
                                $thumbSrc = '../' . ltrim($p['front_image'], '/');
                            } elseif (!empty($p['side_image'])) {
                                $thumbSrc = '../' . ltrim($p['side_image'], '/');
                            } else {
                                $thumbSrc = '../_next/image?url=%2Fproducts%2F' . urlencode($p['slug']) . '-front.webp&w=96&q=75';
                            }
                            ?>
                            <tr>
                                <td>
                                    <img src="<?= $thumbSrc ?>" 
                                         onerror="this.src='../_next/image?url=%2Fproducts%2F<?= urlencode($p['slug']) ?>-side.webp&w=96&q=75'"
                                         style="width: 52px; height: 52px; object-fit: contain; background: #000; border-radius: 8px; padding: 2px;">
                                    <div style="font-size: 11px; color: #64748b; font-family: monospace;"><?= htmlspecialchars($p['slug']) ?></div>
                                </td>
                                <td>
                                    <strong style="color: #fff; font-size: 15px;"><?= htmlspecialchars($p['title']) ?></strong>
                                    <div style="color: #94a3b8; font-size: 13px;"><?= htmlspecialchars($p['title_fa'] ?: '—') ?></div>
                                </td>
                                <td>
                                    <strong style="color: #22c55e;"><?= number_format($p['price']) ?></strong>
                                    <span style="font-size: 12px; color: #94a3b8;"><?= htmlspecialchars($p['currency']) ?></span>
                                </td>
                                <td><?= htmlspecialchars($p['color'] ?: '—') ?></td>
                                <td>
                                    <span style="font-size: 12px; color: #38bdf8; font-family: monospace;"><?= htmlspecialchars($p['sizes'] ?: 'S,M,L,XL') ?></span>
                                </td>
                                <td>
                                    <?php if ($p['is_available']): ?>
                                        <span class="badge badge-green">موجود</span>
                                    <?php else: ?>
                                        <span class="badge badge-red">ناموجود</span>
                                    <?php endif; ?>
                                </td>
                                <td><?= (int)$p['stock_quantity'] ?> عدد</td>
                                <td>
                                    <div style="display: flex; gap: 6px;">
                                        <button class="btn btn-blue btn-sm" onclick='openEditModal(<?= json_encode($p, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP) ?>)'>
                                            ✏️ ویرایش
                                        </button>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('آیا از حذف محصول «<?= htmlspecialchars($p['title']) ?>» مطمئن هستید؟');">
                                            <input type="hidden" name="action" value="delete_product">
                                            <input type="hidden" name="id" value="<?= $p['id'] ?>">
                                            <button type="submit" class="btn btn-red btn-sm" title="حذف">🗑️</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

    <?php elseif ($tab === 'orders'): ?>
        <div class="card">
            <div class="card-title" style="margin-bottom: 16px;">سفارشات ثبت‌شده توسط خریداران</div>
            <?php if (empty($orders)): ?>
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    هنوز سفارشی ثبت نشده است. وقتی مشتریان از طریق سایت سفارش ثبت کنند، در این جدول نمایش داده می‌شود.
                </div>
            <?php else: ?>
                <div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>کد</th>
                                <th>زمان ثبت</th>
                                <th>نام مشتری</th>
                                <th>شماره تماس</th>
                                <th>محصول انتخابی</th>
                                <th>رنگ و سایز</th>
                                <th>آدرس خریدار</th>
                                <th>وضعیت</th>
                                <th>عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($orders as $o): ?>
                                <tr>
                                    <td>#<?= $o['id'] ?></td>
                                    <td style="font-size: 12px; color: #94a3b8;"><?= htmlspecialchars($o['created_at']) ?></td>
                                    <td><strong><?= htmlspecialchars($o['customer_name']) ?></strong></td>
                                    <td style="direction: ltr; text-align: right;"><a href="tel:<?= htmlspecialchars($o['customer_phone']) ?>" style="color: #60a5fa;"><?= htmlspecialchars($o['customer_phone']) ?></a></td>
                                    <td><strong><?= htmlspecialchars($o['product_title']) ?></strong></td>
                                    <td>
                                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                            <?php if (!empty($o['selected_color'])): ?>
                                                <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4);">
                                                    🎨 <?= htmlspecialchars($o['selected_color']) ?>
                                                </span>
                                            <?php endif; ?>
                                            <?php if (!empty($o['selected_size'])): ?>
                                                <span class="badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);">
                                                    📏 <?= htmlspecialchars($o['selected_size']) ?>
                                                </span>
                                            <?php endif; ?>
                                            <?php if (empty($o['selected_color']) && empty($o['selected_size'])): ?>
                                                <span style="color: #64748b;">—</span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td style="max-width: 240px; font-size: 13px;">
                                        <?= htmlspecialchars($o['customer_address'] ?: '—') ?>
                                    </td>
                                    <td>
                                        <?php
                                        $st = $o['status'];
                                        if ($st === 'confirmed') echo '<span class="badge badge-green">تایید شده</span>';
                                        elseif ($st === 'shipped') echo '<span class="badge badge-blue">ارسال شده</span>';
                                        elseif ($st === 'cancelled') echo '<span class="badge badge-red">لغو شده</span>';
                                        else echo '<span class="badge badge-yellow">در انتظار تماس</span>';
                                        ?>
                                    </td>
                                    <td>
                                        <form method="POST" style="display: inline-flex; gap: 6px; align-items: center;">
                                            <input type="hidden" name="action" value="update_order_status">
                                            <input type="hidden" name="order_id" value="<?= $o['id'] ?>">
                                            <select name="status" onchange="this.form.submit()" style="padding: 4px 8px; font-size: 12px; width: auto; background:#090b10; color:#fff; border:1px solid #282f42; border-radius:6px;">
                                                <option value="pending" <?= $o['status'] === 'pending' ? 'selected' : '' ?>>در انتظار</option>
                                                <option value="confirmed" <?= $o['status'] === 'confirmed' ? 'selected' : '' ?>>تایید شده</option>
                                                <option value="shipped" <?= $o['status'] === 'shipped' ? 'selected' : '' ?>>ارسال شده</option>
                                                <option value="cancelled" <?= $o['status'] === 'cancelled' ? 'selected' : '' ?>>لغو شده</option>
                                            </select>
                                        </form>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('آیا از حذف این سفارش مطمئن هستید؟');">
                                            <input type="hidden" name="action" value="delete_order">
                                            <input type="hidden" name="order_id" value="<?= $o['id'] ?>">
                                            <button type="submit" class="btn btn-red btn-sm" title="حذف">🗑️</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>

    <?php elseif ($tab === 'settings'): ?>
        <div class="card" style="max-width: 600px;">
            <div class="card-title" style="margin-bottom: 18px;">تنظیمات لوگو و اطلاعات فروشگاه</div>
            <form method="POST" enctype="multipart/form-data">
                <input type="hidden" name="action" value="update_settings">

                <div class="form-group" style="background: #181c28; padding: 14px; border-radius: 10px; border: 1px solid #222838;">
                    <label style="color: #60a5fa; font-weight: 700; margin-bottom: 8px; display: block;">لوگوی بالای صفحه (Header Logo)</label>
                    <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                        <?php if (!empty($settings['logo_url'])): ?>
                            <div style="background: #0f1219; padding: 8px 14px; border-radius: 8px; border: 1px solid #222838;">
                                <img src="../<?= htmlspecialchars($settings['logo_url']) ?>" alt="Logo Preview" style="height: <?= htmlspecialchars($settings['logo_height'] ?: '36') ?>px; max-width: 140px; object-fit: contain;">
                            </div>
                        <?php endif; ?>
                        <div style="flex: 1; min-width: 200px;">
                            <label style="font-size: 11px; color: #94a3b8;">آپلود عکس جدید لوگو (PNG/SVG/WebP/JPG):</label>
                            <input type="file" name="logo_file" accept="image/*" style="font-size: 12px; padding: 6px;">
                            <input type="hidden" name="logo_url" value="<?= htmlspecialchars($settings['logo_url']) ?>">
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
                        <div>
                            <label style="font-size: 11px; color: #94a3b8;">ارتفاع لوگو (پیکسل):</label>
                            <input type="number" name="logo_height" value="<?= htmlspecialchars($settings['logo_height'] ?: '36') ?>" min="16" max="150" placeholder="36">
                        </div>
                        <div>
                            <label style="font-size: 11px; color: #94a3b8;">عرض لوگو (یا auto):</label>
                            <input type="text" name="logo_width" value="<?= htmlspecialchars($settings['logo_width'] ?: 'auto') ?>" placeholder="auto">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>عنوان اصلی فروشگاه</label>
                    <input type="text" name="store_title" value="<?= htmlspecialchars($settings['store_title']) ?>" required>
                </div>
                <div class="form-group">
                    <label>متن متحرک بالای رگال (Marquee Text)</label>
                    <input type="text" name="marquee_text" value="<?= htmlspecialchars($settings['marquee_text']) ?>" required>
                </div>
                <div class="form-group">
                    <label>شماره تماس / پشتیبانی</label>
                    <input type="text" name="contact_phone" value="<?= htmlspecialchars($settings['contact_phone']) ?>">
                </div>
                <button type="submit" class="btn btn-blue">💾 ذخیره تنظیمات</button>
            </form>
        </div>
    <?php endif; ?>
</div>

<!-- Modal افزودن محصول جدید -->
<div class="modal-overlay" id="addModal">
    <div class="modal">
        <div class="modal-header">
            <div class="card-title" style="margin: 0;">➕ افزودن محصول جدید به رگال</div>
            <button class="modal-close" onclick="closeAddModal()">&times;</button>
        </div>
        <form method="POST" enctype="multipart/form-data">
            <input type="hidden" name="action" value="add_product">

            <div class="form-row">
                <div class="form-group">
                    <label>نام انگلیسی یا اصلی محصول *</label>
                    <input type="text" name="title" required placeholder="مثال: Oversized Vintage Tee">
                </div>
                <div class="form-group">
                    <label>نام فارسی محصول</label>
                    <input type="text" name="title_fa" placeholder="مثال: تی‌شرت اورسایز وینتیج">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>اسلاگ (شناسه انگلیسی یکتا در URL)</label>
                    <input type="text" name="slug" placeholder="مثال: oversized-tee (اختیاری)" style="direction: ltr;">
                </div>
                <div class="form-group">
                    <label>رنگ پیش‌فرض لباس</label>
                    <input type="text" name="color" placeholder="مثال: قرمز / مشکی">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>قیمت محصول *</label>
                    <input type="number" name="price" required placeholder="مثال: 950000">
                </div>
                <div class="form-group">
                    <label>واحد پول</label>
                    <select name="currency">
                        <option value="تومان" selected>تومان</option>
                        <option value="ریال">ریال</option>
                        <option value="هزار تومان">هزار تومان</option>
                        <option value="$">$ (دلار)</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>تعداد موجودی در انبار</label>
                    <input type="number" name="stock_quantity" value="10">
                </div>
                <div class="form-group" style="display: flex; align-items: center; gap: 10px; padding-top: 26px;">
                    <input type="checkbox" name="is_available" id="addIsAvailable" value="1" checked style="width: 20px; height: 20px;">
                    <label for="addIsAvailable" style="margin: 0; cursor: pointer; color: #fff;">محصول موجود است</label>
                </div>
            </div>

            <!-- انتخاب سایزبندی -->
            <div class="form-group">
                <label>سایزهای موجود برای این لباس:</label>
                <div class="size-tags-select">
                    <?php foreach (['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as $sz): ?>
                        <label class="size-check-label">
                            <input type="checkbox" name="sizes[]" value="<?= $sz ?>" checked>
                            <span><?= $sz ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
                <small style="color: #64748b; font-size: 11px; margin-top: 4px; display: block;">این سایزها به صورت برچسب‌های آویزان در سمت چپ پیراهن نمایش داده می‌شوند.</small>
            </div>

            <!-- تصاویر سه‌گانه لباس -->
            <div style="background: #090b10; border: 1px solid #242938; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin-bottom: 10px;">📸 تصاویر چندزاویه لباس جهت رندر سه‌بعدی روی رگال:</div>
                
                <div class="form-group">
                    <label>۱. تصویر از بغل / چوب‌لباسی (Side View) *</label>
                    <input type="file" name="product_image_side" accept="image/*" required>
                    <small style="color: #64748b; font-size: 11px;">هنگامی که لباس روی ریل رگال آویزان است، این زاویه نمایش داده می‌شود.</small>
                </div>

                <div class="form-group">
                    <label>۲. تصویر از جلو (Front View) *</label>
                    <input type="file" name="product_image_front" accept="image/*" required>
                    <small style="color: #64748b; font-size: 11px;">هنگامی که ماوس روی لباس می‌رود، لباس چرخیده و این نما نمایان می‌شود.</small>
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                    <label>۳. تصویر از پشت (Back View - اختیاری)</label>
                    <input type="file" name="product_image_back" accept="image/*">
                    <small style="color: #64748b; font-size: 11px;">در نمای بزرگ‌نمایی (Focus)، با کلیک ماوس لباس چرخیده و پشت آن نمایش داده می‌شود.</small>
                </div>
            </div>

            <!-- رنگ‌بندی‌های دیگر (Colourways) -->
            <div style="background: #090b10; border: 1px solid #242938; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 13px; font-weight: 700; color: #f59e0b;">🎨 رنگ‌بندی‌های دیگر محصول (Colourways):</div>
                    <button type="button" class="btn btn-sm btn-blue" onclick="addColourwayRow('addCwContainer')">➕ افزودن رنگ</button>
                </div>
                <small style="color: #64748b; font-size: 11px; display: block; margin-bottom: 10px;">در صورت تعریف، دایره‌های رنگی آویزان در سمت راست لباس باز می‌شوند و با کلیک روی هر رنگ، تصویر پیراهن به آن رنگ تغییر می‌کند.</small>
                <div id="addCwContainer"></div>
            </div>

            <div class="form-group">
                <label>لینک مستقیم خرید / درگاه (اختیاری)</label>
                <input type="text" name="buy_url" placeholder="https://..." style="direction: ltr;">
            </div>

            <div class="form-group">
                <label>توضیحات و مشخصات</label>
                <textarea name="description" placeholder="جنس پارچه، جدول سایز و توضیحات محصول..."></textarea>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button type="button" class="btn" style="background: #282d3c; color: #cbd5e1;" onclick="closeAddModal()">انصراف</button>
                <button type="submit" class="btn btn-green">➕ افزودن و ذخیره محصول</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal ویرایش محصول -->
<div class="modal-overlay" id="editModal">
    <div class="modal">
        <div class="modal-header">
            <div class="card-title" id="modalProductTitle" style="margin: 0;">ویرایش محصول</div>
            <button class="modal-close" onclick="closeEditModal()">&times;</button>
        </div>
        <form method="POST" enctype="multipart/form-data">
            <input type="hidden" name="action" value="edit_product">
            <input type="hidden" name="id" id="editId">

            <div class="form-row">
                <div class="form-group">
                    <label>نام محصول (انگلیسی یا اصلی)</label>
                    <input type="text" name="title" id="editTitle" required>
                </div>
                <div class="form-group">
                    <label>نام فارسی محصول</label>
                    <input type="text" name="title_fa" id="editTitleFa">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>قیمت</label>
                    <input type="number" name="price" id="editPrice" required>
                </div>
                <div class="form-group">
                    <label>واحد پول</label>
                    <select name="currency" id="editCurrency">
                        <option value="تومان">تومان</option>
                        <option value="ریال">ریال</option>
                        <option value="هزار تومان">هزار تومان</option>
                        <option value="$">$ (دلار)</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>رنگ اصلی لباس</label>
                    <input type="text" name="color" id="editColor">
                </div>
                <div class="form-group">
                    <label>تعداد موجودی در انبار</label>
                    <input type="number" name="stock_quantity" id="editStock" value="10">
                </div>
            </div>

            <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" name="is_available" id="editIsAvailable" value="1" style="width: 20px; height: 20px;">
                <label for="editIsAvailable" style="margin: 0; cursor: pointer; color: #fff;">محصول موجود است</label>
            </div>

            <!-- انتخاب سایزبندی ویرایش -->
            <div class="form-group">
                <label>سایزهای موجود:</label>
                <div class="size-tags-select" id="editSizesContainer">
                    <?php foreach (['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as $sz): ?>
                        <label class="size-check-label">
                            <input type="checkbox" name="sizes[]" value="<?= $sz ?>" id="edit_size_<?= $sz ?>">
                            <span><?= $sz ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- تصاویر سه‌گانه ویرایش -->
            <div style="background: #090b10; border: 1px solid #242938; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="font-size: 13px; font-weight: 700; color: #38bdf8; margin-bottom: 10px;">📸 تغییر تصاویر چندزاویه (اختیاری - در صورت انتخاب فایل جدید جایگزین می‌شود):</div>

                <div class="form-group">
                    <label>تصویر از بغل / چوب‌لباسی (Side View)</label>
                    <input type="file" name="product_image_side" accept="image/*">
                </div>

                <div class="form-group">
                    <label>تصویر از جلو (Front View)</label>
                    <input type="file" name="product_image_front" accept="image/*">
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                    <label>تصویر از پشت (Back View)</label>
                    <input type="file" name="product_image_back" accept="image/*">
                </div>
            </div>

            <!-- رنگ‌بندی‌ها در ویرایش -->
            <div style="background: #090b10; border: 1px solid #242938; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 13px; font-weight: 700; color: #f59e0b;">🎨 رنگ‌بندی‌های دیگر محصول:</div>
                    <button type="button" class="btn btn-sm btn-blue" onclick="addColourwayRow('editCwContainer')">➕ افزودن رنگ</button>
                </div>
                <div id="editCwContainer"></div>
            </div>

            <div class="form-group">
                <label>لینک خرید مستقیم (اختیاری)</label>
                <input type="text" name="buy_url" id="editBuyUrl" placeholder="https://..." style="direction: ltr;">
            </div>

            <div class="form-group">
                <label>توضیحات محصول</label>
                <textarea name="description" id="editDescription"></textarea>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
                <button type="button" class="btn" style="background: #282d3c; color: #cbd5e1;" onclick="closeEditModal()">انصراف</button>
                <button type="submit" class="btn btn-blue">💾 ذخیره تغییرات</button>
            </div>
        </form>
    </div>
</div>

<script>
function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function openEditModal(product) {
    document.getElementById('editId').value = product.id;
    document.getElementById('modalProductTitle').innerText = 'ویرایش: ' + (product.title_fa || product.title);
    document.getElementById('editTitle').value = product.title || '';
    document.getElementById('editTitleFa').value = product.title_fa || '';
    document.getElementById('editPrice').value = product.price || 0;
    document.getElementById('editCurrency').value = product.currency || 'تومان';
    document.getElementById('editColor').value = product.color || '';
    document.getElementById('editStock').value = product.stock_quantity || 0;
    document.getElementById('editIsAvailable').checked = parseInt(product.is_available) === 1;
    document.getElementById('editBuyUrl').value = product.buy_url || '';
    document.getElementById('editDescription').value = product.description || '';

    // سایزها
    const allSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const pSizes = (product.sizes || 'S,M,L,XL,XXL').split(',').map(s => s.trim());
    allSizes.forEach(sz => {
        const cb = document.getElementById('edit_size_' + sz);
        if (cb) cb.checked = pSizes.includes(sz);
    });

    // رنگ‌بندی‌ها
    const editCw = document.getElementById('editCwContainer');
    editCw.innerHTML = '';
    if (product.colourways) {
        try {
            const cwList = typeof product.colourways === 'string' ? JSON.parse(product.colourways) : product.colourways;
            if (Array.isArray(cwList)) {
                cwList.forEach((cw, idx) => {
                    addColourwayRow('editCwContainer', cw, idx);
                });
            }
        } catch (e) {}
    }
    
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function addColourwayRow(containerId, data = null, index = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const rowId = 'cw_' + Math.random().toString(36).substr(2, 9);
    const label = data ? (data.label || '') : '';
    const hex = data ? (data.hex || '#000000') : '#000000';
    const existingFront = data ? (data.front || '') : '';
    const existingSide = data ? (data.side || '') : '';
    const existingBack = data ? (data.back || '') : '';

    const row = document.createElement('div');
    row.className = 'cw-row';
    row.id = rowId;
    row.innerHTML = `
        <div>
            <input type="text" name="cw_label[]" value="${label}" placeholder="نام رنگ (مثال: مشکی)" required style="padding: 6px 8px; font-size: 12px;">
        </div>
        <div>
            <input type="color" name="cw_hex[]" value="${hex}" style="height: 36px; padding: 2px; cursor: pointer; border-radius: 6px;">
        </div>
        <div>
            <label style="font-size: 10px; color: #94a3b8; display: block;">عکس جلو (Front):</label>
            <input type="file" name="cw_front_file[]" accept="image/*" style="padding: 4px; font-size: 11px;">
            <input type="hidden" name="cw_existing_front[]" value="${existingFront}">
        </div>
        <div>
            <label style="font-size: 10px; color: #94a3b8; display: block;">عکس بغل (Side):</label>
            <input type="file" name="cw_side_file[]" accept="image/*" style="padding: 4px; font-size: 11px;">
            <input type="hidden" name="cw_existing_side[]" value="${existingSide}">
        </div>
        <div>
            <label style="font-size: 10px; color: #94a3b8; display: block;">عکس پشت (Back):</label>
            <input type="file" name="cw_back_file[]" accept="image/*" style="padding: 4px; font-size: 11px;">
            <input type="hidden" name="cw_existing_back[]" value="${existingBack}">
        </div>
        <div>
            <button type="button" class="btn btn-red btn-sm" onclick="document.getElementById('${rowId}').remove()" style="padding: 6px 10px;">✕</button>
        </div>
    `;
    container.appendChild(row);
}

window.onclick = function(e) {
    if (e.target === document.getElementById('editModal')) closeEditModal();
    if (e.target === document.getElementById('addModal')) closeAddModal();
}
</script>

</body>
</html>
