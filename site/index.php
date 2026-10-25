<?php
/**
 * Dynamic Entry Point for Store
 * این فایل مسیر جاری را به صورت هوشمند تشخیص می‌دهد و چه سایت روی ریشه دامنه (/)
 * و چه در ساب‌دایرکتوری (مانند /store/site/) باشد، تمام آدرس‌های CSS، JS و تصاویر را به صورت خودکار اصلاح می‌کند.
 */

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

// اگر سایت در ساب‌دایرکتوری نصب شده است (مثلاً /store/site/)
if ($baseClean !== '/') {
    // اصلاح تمام ارجاعات /_next/ (شامل تمام عکس‌ها در srcset، فونت‌ها و اسکریپت‌ها)
    $html = str_replace('/_next/', $baseClean . '_next/', $html);
    $html = str_replace('href="/favicon.ico', 'href="' . $baseClean . 'favicon.ico', $html);
    $html = str_replace('src="/store-dynamic.js"', 'src="' . $baseClean . 'store-dynamic.js"', $html);
    $html = str_replace('href="/store-dynamic.js"', 'href="' . $baseClean . 'store-dynamic.js"', $html);

    // تعریف متغیر مسیر پایه برای Turbopack و React
    $baseScript = '<script>window.STORE_BASE_PATH="' . $baseClean . '";window.TURBOPACK_CHUNK_BASE_PATH="' . $baseClean . '_next/";</script>';
    $html = preg_replace('/<head>/i', '<head>' . $baseScript, $html, 1);
} else {
    $baseScript = '<script>window.STORE_BASE_PATH="/";window.TURBOPACK_CHUNK_BASE_PATH="/_next/";</script>';
    $html = preg_replace('/<head>/i', '<head>' . $baseScript, $html, 1);
}

// تنظیم هدر خروجی
header('Content-Type: text/html; charset=utf-8');
echo $html;
