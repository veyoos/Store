<?php
/**
 * Database Configuration for Store
 * مشخصات اتصال به پایگاه داده MySQL در cPanel / DirectAdmin
 */

// ۱. مشخصات دیتابیس خود در سی‌پنل را در اینجا وارد کنید:
define('DB_HOST', 'localhost');                  // در اغلب هاست‌ها همان localhost است
define('DB_NAME', 'your_db_name');              // نام دیتابیسی که در cPanel ساختید
define('DB_USER', 'your_db_user');              // نام کاربری دیتابیس
define('DB_PASS', 'your_db_password');          // رمز عبور دیتابیس
define('DB_CHARSET', 'utf8mb4');

// تابع اتصال به پایگاه داده با استفاده از PDO
function get_db() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // بررسی اینکه آیا مقادیر هنوز پیش‌فرض هستند یا نه
    if (DB_NAME === 'your_db_name') {
        return null;
    }

    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// تابع دریافت تنظیمات سایت از دیتابیس
function get_setting($key, $default = '') {
    $db = get_db();
    if (!$db) return $default;
    try {
        $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        return $row ? $row['setting_value'] : $default;
    } catch (Exception $e) {
        return $default;
    }
}
