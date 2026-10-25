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

// ساخت خودکار ستون‌های جدید تصویر در صورت عدم وجود (Migration بدون نیاز به اجرای دستی SQL)
if ($db) {
    try {
        $db->exec("ALTER TABLE products ADD COLUMN front_image VARCHAR(500) DEFAULT '' AFTER description");
    } catch (Exception $e) {}
    try {
        $db->exec("ALTER TABLE products ADD COLUMN side_image VARCHAR(500) DEFAULT '' AFTER front_image");
    } catch (Exception $e) {}
}

// تابع کمکی برای آپلود ایمن تصاویر محصولات
function handle_image_upload($fileInputName, $slug) {
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
    
    $safeSlug = preg_replace('/[^a-z0-9\-]/i', '', $slug) ?: 'product';
    $fileName = $safeSlug . '-' . time() . '.' . $ext;
    $targetPath = $uploadDir . $fileName;
    
    if (move_uploaded_file($tmpName, $targetPath)) {
        return 'uploads/' . $fileName;
    }
    return '';
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

            $frontImage = handle_image_upload('product_image', $slug);

            try {
                $stmt = $db->prepare("INSERT INTO products (slug, title, title_fa, price, currency, is_available, stock_quantity, color, buy_url, description, front_image, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 99)");
                $stmt->execute([$slug, $title, $titleFa, $price, $currency, $isAvailable, $stock, $color, $buyUrl, $description, $frontImage]);
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

        $newImage = handle_image_upload('product_image', 'p-' . $id);

        try {
            if (!empty($newImage)) {
                $stmt = $db->prepare("UPDATE products SET title = ?, title_fa = ?, price = ?, currency = ?, color = ?, is_available = ?, stock_quantity = ?, buy_url = ?, description = ?, front_image = ? WHERE id = ?");
                $stmt->execute([$title, $titleFa, $price, $currency, $color, $isAvailable, $stock, $buyUrl, $description, $newImage, $id]);
            } else {
                $stmt = $db->prepare("UPDATE products SET title = ?, title_fa = ?, price = ?, currency = ?, color = ?, is_available = ?, stock_quantity = ?, buy_url = ?, description = ? WHERE id = ?");
                $stmt->execute([$title, $titleFa, $price, $currency, $color, $isAvailable, $stock, $buyUrl, $description, $id]);
            }
            $msg = 'محصول با موفقیت به‌روزرسانی شد.';
            $msgType = 'success';
        } catch (Exception $e) {
            $msg = 'خطا در ویرایش محصول: ' . $e->getMessage();
            $msgType = 'error';
        }
    }

    // ۳. حذف محصول
    if ($action === 'delete_product' && $db) {
        $id = (int)$_POST['id'];
        try {
            $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $msg = 'محصول با موفقیت حذف شد.';
            $msgType = 'success';
        } catch (Exception $e) {
            $msg = 'خطا در حذف محصول: ' . $e->getMessage();
            $msgType = 'error';
        }
    }

    // ۴. به‌روزرسانی تنظیمات
    if ($action === 'update_settings' && $db) {
        $settingsToUpdate = [
            'store_title'   => $_POST['store_title'] ?? '',
            'marquee_text'  => $_POST['marquee_text'] ?? '',
            'contact_phone' => $_POST['contact_phone'] ?? '',
            'instagram'     => $_POST['instagram'] ?? '',
            'telegram'      => $_POST['telegram'] ?? ''
        ];
        try {
            $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
            foreach ($settingsToUpdate as $k => $v) {
                $stmt->execute([$k, trim($v)]);
            }
            $msg = 'تنظیمات با موفقیت ذخیره شد.';
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
        } catch (Exception $e) {
            $msg = 'خطا: ' . $e->getMessage();
            $msgType = 'error';
        }
    }

    // ۷. تغییر رمز عبور
    if ($action === 'change_password' && $db) {
        $newPass = trim($_POST['new_password'] ?? '');
        if (strlen($newPass) >= 6) {
            $hash = password_hash($newPass, PASSWORD_BCRYPT);
            try {
                $stmt = $db->prepare("UPDATE admin_users SET password_hash = ? WHERE username = ?");
                $stmt->execute([$hash, $_SESSION['admin_username']]);
                $msg = 'رمز عبور با موفقیت تغییر کرد.';
            } catch (Exception $e) {
                $msg = 'خطا در تغییر رمز: ' . $e->getMessage();
                $msgType = 'error';
            }
        } else {
            $msg = 'طول رمز عبور جدید باید حداقل ۶ کاراکتر باشد.';
            $msgType = 'error';
        }
    }
}

// واکشی داده‌ها
$products = [];
$orders   = [];
$settings = [
    'store_title'   => 'فروشگاه رگال لباس | Fancy Clothes',
    'marquee_text'  => 'IT\'S US, NEVER THEM  •  NEW DROPS  •  کالکشن جدید لباس  •  ارسال به سراسر کشور',
    'contact_phone' => '09120000000',
    'instagram'     => '@store_iran',
    'telegram'      => '@store_iran'
];

if ($db) {
    try {
        $products = $db->query("SELECT * FROM products ORDER BY sort_order ASC, id ASC")->fetchAll();
        $orders   = $db->query("SELECT * FROM orders ORDER BY id DESC LIMIT 50")->fetchAll();
        $settingsStmt = $db->query("SELECT setting_key, setting_value FROM settings");
        while ($row = $settingsStmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
    } catch (Exception $e) {
        $dbError = $e->getMessage();
    }
}

$tab = $_GET['tab'] ?? 'products';
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>پنل مدیریت فروشگاه</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; }
        body { background: #0c0e12; color: #e2e8f0; min-height: 100vh; }
        header { background: #161922; border-bottom: 1px solid #232734; padding: 16px 28px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: 18px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }
        .header-links { display: flex; align-items: center; gap: 16px; font-size: 14px; }
        .header-links a { color: #94a3b8; text-decoration: none; transition: color 0.2s; }
        .header-links a:hover { color: #fff; }
        .logout-btn { background: #dc2626; color: #fff !important; padding: 6px 14px; border-radius: 6px; }

        .container { max-width: 1200px; margin: 28px auto; padding: 0 20px; }
        
        .db-status { padding: 14px 18px; border-radius: 10px; margin-bottom: 24px; font-size: 14px; display: flex; align-items: center; justify-content: space-between; }
        .db-ok { background: #064e3b; border: 1px solid #059669; color: #a7f3d0; }
        .db-warn { background: #451a03; border: 1px solid #b45309; color: #fde68a; }

        .msg-box { padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
        .msg-success { background: #064e3b; color: #a7f3d0; }
        .msg-error { background: #450a0a; color: #fca5a5; }

        .tabs { display: flex; gap: 8px; border-bottom: 1px solid #232734; margin-bottom: 24px; }
        .tab-btn { padding: 12px 20px; background: none; border: none; color: #94a3b8; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; border-bottom: 2px solid transparent; }
        .tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }

        .card { background: #161922; border: 1px solid #232734; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .card-title { font-size: 17px; font-weight: 700; color: #fff; }

        table { width: 100%; border-collapse: collapse; text-align: right; }
        th { background: #1c202c; color: #94a3b8; font-size: 13px; font-weight: 600; padding: 12px 16px; border-bottom: 1px solid #282d3c; }
        td { padding: 14px 16px; border-bottom: 1px solid #1f2432; font-size: 14px; vertical-align: middle; }
        tr:hover td { background: #191d28; }

        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-green { background: #064e3b; color: #6ee7b7; }
        .badge-red { background: #7f1d1d; color: #fca5a5; }
        .badge-yellow { background: #78350f; color: #fde68a; }

        .btn { padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
        .btn-blue { background: #2563eb; color: #fff; }
        .btn-blue:hover { background: #1d4ed8; }
        .btn-green { background: #059669; color: #fff; }
        .btn-green:hover { background: #047857; }
        .btn-red { background: #dc2626; color: #fff; }
        .btn-red:hover { background: #b91c1c; }
        .btn-sm { padding: 5px 10px; font-size: 12px; }

        .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 16px; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; color: #94a3b8; }
        input[type="text"], input[type="number"], input[type="password"], input[type="file"], textarea, select {
            width: 100%; padding: 10px 14px; background: #0c0e12; border: 1px solid #282d3c; border-radius: 8px; color: #fff; font-size: 14px;
        }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #3b82f6; }
        textarea { resize: vertical; min-height: 80px; }

        /* Modal */
        .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 999; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #161922; border: 1px solid #282d3c; border-radius: 14px; padding: 28px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-close { background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; }
    </style>
</head>
<body>

<header>
    <div class="logo">
        👕 <span>مدیریت فروشگاه رگال</span>
    </div>
    <div class="header-links">
        <a href="../" target="_blank">👁️ مشاهده سایت فروشگاه</a>
        <span>کاربر: <strong><?= htmlspecialchars($_SESSION['admin_username']) ?></strong></span>
        <a href="logout.php" class="logout-btn">خروج</a>
    </div>
</header>

<div class="container">
    <?php if ($db): ?>
        <div class="db-status db-ok">
            <span>✅ <strong>دیتابیس متصل است:</strong> اتصال به MySQL برقرار است و تغییرات در لحظه اعمال می‌شوند.</span>
        </div>
    <?php else: ?>
        <div class="db-status db-warn">
            <div>
                ⚠️ <strong>دیتابیس متصل نیست!</strong> مشخصات دیتابیس در <code>config.php</code> را بررسی کنید.
            </div>
        </div>
    <?php endif; ?>

    <?php if ($msg): ?>
        <div class="msg-box <?= $msgType === 'error' ? 'msg-error' : 'msg-success' ?>">
            <?= htmlspecialchars($msg) ?>
        </div>
    <?php endif; ?>

    <div class="tabs">
        <a href="?tab=products" class="tab-btn <?= $tab === 'products' ? 'active' : '' ?>">📦 محصولات رگال (<?= count($products) ?>)</a>
        <a href="?tab=orders" class="tab-btn <?= $tab === 'orders' ? 'active' : '' ?>">🛍️ سفارشات مشتریان (<?= count($orders) ?>)</a>
        <a href="?tab=settings" class="tab-btn <?= $tab === 'settings' ? 'active' : '' ?>">⚙️ تنظیمات سایت</a>
    </div>

    <?php if ($tab === 'products'): ?>
        <div class="card">
            <div class="card-header">
                <div class="card-title">لیست تمامی لباس‌های فروشگاه</div>
                <button class="btn btn-green" onclick="openAddModal()">➕ افزودن محصول جدید</button>
            </div>
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>تصویر</th>
                            <th>نام محصول (انگلیسی و فارسی)</th>
                            <th>قیمت</th>
                            <th>رنگ</th>
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
                                $thumbSrc = '../' . htmlspecialchars($p['front_image']);
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
                                    <strong style="color: #60a5fa;"><?= number_format($p['price']) ?></strong>
                                    <span style="font-size: 12px; color: #94a3b8;"><?= htmlspecialchars($p['currency']) ?></span>
                                </td>
                                <td><?= htmlspecialchars($p['color'] ?: '—') ?></td>
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
            <div class="card-title">سفارشات ثبت‌شده توسط خریداران</div>
            <?php if (empty($orders)): ?>
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    هنوز سفارشی ثبت نشده است. وقتی مشتریان از طریق سایت سفارش ثبت کنند، در این جدول نمایش داده می‌شود.
                </div>
            <?php else: ?>
                <div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>شماره</th>
                                <th>تاریخ ثبت</th>
                                <th>نام مشتری</th>
                                <th>شماره تماس</th>
                                <th>محصول انتخابی</th>
                                <th>آدرس و توضیحات</th>
                                <th>وضعیت</th>
                                <th>تغییر وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($orders as $o): ?>
                                <tr>
                                    <td>#<?= $o['id'] ?></td>
                                    <td style="font-size: 12px; color: #94a3b8;"><?= htmlspecialchars($o['created_at']) ?></td>
                                    <td><strong><?= htmlspecialchars($o['customer_name']) ?></strong></td>
                                    <td style="direction: ltr; text-align: right;"><a href="tel:<?= htmlspecialchars($o['customer_phone']) ?>" style="color: #60a5fa;"><?= htmlspecialchars($o['customer_phone']) ?></a></td>
                                    <td><?= htmlspecialchars($o['product_title']) ?></td>
                                    <td style="max-width: 260px; font-size: 13px;">
                                        <?= htmlspecialchars($o['customer_address'] ?: '—') ?>
                                        <?php if (!empty($o['notes'])): ?>
                                            <div style="color: #fde68a; font-size: 12px; margin-top: 4px;">یادداشت: <?= htmlspecialchars($o['notes']) ?></div>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <?php
                                        $st = $o['status'];
                                        if ($st === 'confirmed') echo '<span class="badge badge-green">تایید شده</span>';
                                        elseif ($st === 'shipped') echo '<span class="badge badge-blue" style="background:#1e3a8a;color:#93c5fd;">ارسال شده</span>';
                                        elseif ($st === 'cancelled') echo '<span class="badge badge-red">لغو شده</span>';
                                        else echo '<span class="badge badge-yellow">در انتظار تماس</span>';
                                        ?>
                                    </td>
                                    <td>
                                        <form method="POST" style="display: inline-flex; gap: 6px; align-items: center;">
                                            <input type="hidden" name="action" value="update_order_status">
                                            <input type="hidden" name="order_id" value="<?= $o['id'] ?>">
                                            <select name="status" onchange="this.form.submit()" style="padding: 4px 8px; font-size: 12px; width: auto;">
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
        <div class="card">
            <div class="card-title">تنظیمات اصلی فروشگاه</div>
            <form method="POST">
                <input type="hidden" name="action" value="update_settings">
                
                <div class="form-row">
                    <div class="form-group">
                        <label>عنوان سایت</label>
                        <input type="text" name="store_title" value="<?= htmlspecialchars($settings['store_title'] ?? '') ?>">
                    </div>
                    <div class="form-group">
                        <label>شماره تماس / پشتیبانی</label>
                        <input type="text" name="contact_phone" value="<?= htmlspecialchars($settings['contact_phone'] ?? '') ?>">
                    </div>
                </div>

                <div class="form-group">
                    <label>متن نوار متحرک پایین صفحه (Marquee Banner)</label>
                    <input type="text" name="marquee_text" value="<?= htmlspecialchars($settings['marquee_text'] ?? '') ?>">
                    <small style="color: #64748b; font-size: 12px;">این متن در نوار زرد متحرک پایین صفحه به کاربران نمایش داده می‌شود.</small>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>آیدی اینستاگرام</label>
                        <input type="text" name="instagram" value="<?= htmlspecialchars($settings['instagram'] ?? '') ?>" placeholder="@yourstore">
                    </div>
                    <div class="form-group">
                        <label>آیدی تلگرام</label>
                        <input type="text" name="telegram" value="<?= htmlspecialchars($settings['telegram'] ?? '') ?>" placeholder="@yourstore">
                    </div>
                </div>

                <button type="submit" class="btn btn-blue">💾 ذخیره تنظیمات</button>
            </form>
        </div>

        <div class="card">
            <div class="card-title">تغییر رمز عبور مدیریت</div>
            <form method="POST">
                <input type="hidden" name="action" value="change_password">
                <div class="form-group" style="max-width: 380px;">
                    <label>رمز عبور جدید</label>
                    <input type="password" name="new_password" placeholder="حداقل ۶ کاراکتر" required>
                </div>
                <button type="submit" class="btn btn-blue">🔑 تغییر رمز عبور</button>
            </form>
        </div>
    <?php endif; ?>
</div>

<!-- Modal افزودن محصول جدید -->
<div class="modal-overlay" id="addModal">
    <div class="modal">
        <div class="modal-header">
            <div class="card-title">➕ افزودن محصول جدید به فروشگاه</div>
            <button class="modal-close" onclick="closeAddModal()">&times;</button>
        </div>
        <form method="POST" enctype="multipart/form-data">
            <input type="hidden" name="action" value="add_product">

            <div class="form-row">
                <div class="form-group">
                    <label>نام محصول (انگلیسی یا لاتین) *</label>
                    <input type="text" name="title" required placeholder="مثال: Oversized Graphic Tee">
                </div>
                <div class="form-group">
                    <label>نام فارسی محصول</label>
                    <input type="text" name="title_fa" placeholder="مثال: تی‌شرت اورسایز طرح گرافیکی">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>شناسه یکتا (Slug - اختیاری)</label>
                    <input type="text" name="slug" placeholder="مثال: oversized-graphic-tee" style="direction: ltr;">
                    <small style="color: #64748b; font-size: 11px;">اگر خالی بگذارید به طور خودکار ساخته می‌شود.</small>
                </div>
                <div class="form-group">
                    <label>رنگ لباس</label>
                    <input type="text" name="color" placeholder="مثال: مشکی / Black">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>قیمت *</label>
                    <input type="number" name="price" required placeholder="مثال: 850000">
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

            <div class="form-group">
                <label>تصویر محصول (آپلود عکس JPG, PNG, WebP)</label>
                <input type="file" name="product_image" accept="image/*">
                <small style="color: #64748b; font-size: 12px;">پیشنهاد: تصویر لباس با پس‌زمینه شفاف یا ساده جهت نمایش تمیز.</small>
            </div>

            <div class="form-group">
                <label>لینک مستقیم خرید / درگاه (اختیاری)</label>
                <input type="text" name="buy_url" placeholder="https://..." style="direction: ltr;">
                <small style="color: #64748b; font-size: 12px;">در صورت خالی بودن، فرم ثبت سفارش آنلاین در سایت برای خریدار باز می‌شود.</small>
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
                    <input type="text" name="title_fa" id="editTitleFa" placeholder="مثال: پیراهن آستین بلند">
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
                    <label>رنگ لباس</label>
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

            <div class="form-group">
                <label>تغییر یا جایگزینی تصویر (اختیاری)</label>
                <input type="file" name="product_image" accept="image/*">
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
    
    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

window.onclick = function(e) {
    if (e.target === document.getElementById('editModal')) closeEditModal();
    if (e.target === document.getElementById('addModal')) closeAddModal();
}
</script>

</body>
</html>
