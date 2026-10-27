<?php
/**
 * Dynamic Entry Point for Store
 * این فایل مسیر جاری را به صورت هوشمند تشخیص می‌دهد و چه سایت روی ریشه دامنه (/)
 * و چه در ساب‌دایرکتوری (مانند /store/site/) باشد، تمام آدرس‌های CSS، JS و تصاویر را به صورت خودکار اصلاح می‌کند.
 * همچنین محصولات پایگاه داده MySQL را مستقیماً به صفحه تزریق می‌کند تا رگال متحرک بلادرنگ با محصولات دیتابیس هماهنگ شود.
 */

require_once __DIR__ . '/config.php';

$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH) ?: '/';

// پاک کردن index.php یا index.html از انتهای مسیر
$base = preg_replace('#index\.(php|html)$#i', '', $path);
if ($base === '') {
    $base = '/';
}

// در صورتی که مسیر فاقد اسلش پایانی باشد (/store/site)، به /store/site/ ریدایرکت می‌کنیم
if (substr($base, -1) !== '/') {
    $qs = !empty($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : '';
    header("Location: " . $base . "/" . $qs, true, 301);
    exit;
}

$htmlFile = __DIR__ . '/index.html';
if (!file_exists($htmlFile)) {
    die("خطا: فایل index.html یافت نشد. لطفاً مطمئن شوید تمامی فایل‌ها به درستی آپلود شده‌اند.");
}

$html = file_get_contents($htmlFile);

$baseClean = rtrim($base, '/') . '/';

// دریافت محصولات از پایگاه داده
$db = get_db();
$productsJson = 'null';
$settingsJson = 'null';

if ($db) {
    try {
        $stmt = $db->query("SELECT * FROM products ORDER BY sort_order ASC, id ASC");
        $dbProducts = $stmt->fetchAll();
        if (!empty($dbProducts)) {
            $formatted = array_map(function($p) {
                $p['price'] = (int)$p['price'];
                $p['is_available'] = (int)$p['is_available'];
                $p['stock_quantity'] = (int)$p['stock_quantity'];
                $p['formatted_price'] = number_format($p['price']) . ' ' . $p['currency'];
                return $p;
            }, $dbProducts);
            $productsJson = json_encode($formatted, JSON_UNESCAPED_UNICODE);
        }

        $stmtSet = $db->query("SELECT setting_key, setting_value FROM settings");
        $settings = [];
        while ($row = $stmtSet->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        if (!empty($settings)) {
            $settingsJson = json_encode($settings, JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {}
}

// اگر سایت در ساب‌دایرکتوری نصب شده است (مثلاً /store/site/)
if ($baseClean !== '/') {
    // اصلاح تمام ارجاعات /_next/ (شامل تمام عکس‌ها در srcset، فونت‌ها و اسکریپت‌ها)
    $html = str_replace('/_next/', $baseClean . '_next/', $html);
    $html = str_replace('href="/favicon.ico', 'href="' . $baseClean . 'favicon.ico', $html);
    $html = str_replace('href="custom.css"', 'href="' . $baseClean . 'custom.css"', $html);
    $html = str_replace('src="store-dynamic.js"', 'src="' . $baseClean . 'store-dynamic.js"', $html);
    $html = str_replace('src="/store-dynamic.js"', 'src="' . $baseClean . 'store-dynamic.js"', $html);
    $html = str_replace('href="/store-dynamic.js"', 'href="' . $baseClean . 'store-dynamic.js"', $html);
}

// جایگزینی لوگوی اختصاصی در صورت تنظیم در پنل مدیریت
if (!empty($settings['logo_url'])) {
    $logoUrl = $settings['logo_url'];
    if (strpos($logoUrl, 'http') !== 0 && strpos($logoUrl, '/') !== 0) {
        $logoUrl = $baseClean . $logoUrl;
    }
    $html = preg_replace('#src="[^"]*snug-wrld-logo\.png[^"]*"#i', 'src="' . htmlspecialchars($logoUrl) . '"', $html);
    $html = preg_replace('#srcSet="[^"]*snug-wrld-logo\.png[^"]*"#i', '', $html);
    if (!empty($settings['logo_height'])) {
        $lh = (int)$settings['logo_height'];
        $html = str_replace('height:36px;width:auto', 'height:' . $lh . 'px;width:auto', $html);
    }
}

// تزریق داده‌های پایگاه داده به متغیرهای گلوبال جاوااسکریپت قبل از اجرای باندل Next.js
$injectedScript = '<script>';
$injectedScript .= 'window.STORE_BASE_PATH="' . $baseClean . '";';
$injectedScript .= 'window.TURBOPACK_CHUNK_BASE_PATH="' . $baseClean . '_next/";';
if ($productsJson !== 'null') {
    $injectedScript .= 'window.__DB_PRODUCTS__=' . $productsJson . ';';
}
if ($settingsJson !== 'null') {
    $injectedScript .= 'window.__DB_SETTINGS__=' . $settingsJson . ';';
}
$injectedScript .= '</script>';
$injectedScript .= '<script>if(window.__DB_PRODUCTS__ && (window.__DB_PRODUCTS__.length !== 7 || window.__DB_PRODUCTS__.some(function(p){ return p.front_image || p.side_image; }))){ document.documentElement.id = "__next_error__"; }</script>';

$html = preg_replace('/<head>/i', '<head>' . $injectedScript, $html, 1);

// تنظیم هدر خروجی
header('Content-Type: text/html; charset=utf-8');
echo $html;
