-- ========================================================
-- دیتابیس MySQL برای فروشگاه لباس
-- مناسب برای phpMyAdmin در cPanel / DirectAdmin / MariaDB / MySQL
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. جدول محصولات (Products)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `title_fa` VARCHAR(255) DEFAULT '',
  `price` BIGINT DEFAULT 0,
  `currency` VARCHAR(20) DEFAULT 'تومان',
  `is_available` TINYINT(1) DEFAULT 1,
  `stock_quantity` INT DEFAULT 10,
  `color` VARCHAR(100) DEFAULT '',
  `sizes` VARCHAR(255) DEFAULT 'S,M,L,XL,XXL',
  `colourways` LONGTEXT,
  `front_image` VARCHAR(500) DEFAULT '',
  `side_image` VARCHAR(500) DEFAULT '',
  `back_image` VARCHAR(500) DEFAULT '',
  `buy_url` VARCHAR(500) DEFAULT '',
  `description` TEXT,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول سفارشات مشتریان (Orders)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NULL,
  `product_title` VARCHAR(255) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_address` TEXT,
  `selected_color` VARCHAR(100) DEFAULT '',
  `selected_size` VARCHAR(50) DEFAULT '',
  `notes` TEXT,
  `status` VARCHAR(50) DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول تنظیمات سایت (Settings)
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول مدیران (Admin Users)
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- مقادیر پیش‌فرض تنظیمات
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('store_title', 'فروشگاه رگال لباس | Fancy Clothes'),
('marquee_text', 'IT\'S US, NEVER THEM  •  NEW DROPS  •  کالکشن جدید لباس  •  ارسال به سراسر کشور'),
('contact_phone', '09120000000'),
('instagram', '@store_iran'),
('telegram', '@store_iran')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- مدیر پیش‌فرض (نام کاربری: admin / رمز عبور: admin123)
INSERT INTO `admin_users` (`username`, `password_hash`) VALUES
('admin', '$2b$12$iUoZLs.ncNX3D3HLGkW.e.mTImz.pGS1jVy06m/VRsBhucv1l1/2O')
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`);

-- محصولات اولیه منطبق بر رگال متحرک سایت
INSERT INTO `products` (`slug`, `title`, `title_fa`, `price`, `currency`, `is_available`, `stock_quantity`, `color`, `sizes`, `front_image`, `side_image`, `back_image`, `buy_url`, `description`, `sort_order`) VALUES
('crimson-memory', 'Crimson Memory LS Shirt', 'پیراهن آستین بلند کریمسون', 1250000, 'تومان', 1, 8, 'White', 'S,M,L,XL,XXL', '', '', '', '', 'پیراهن آستین بلند نخی با کیفیت عالی و دوخت سفارشی', 1),
('its-us-tee', 'It\'s Us Never Them Tee', 'تی‌شرت مشکی/صورتی/زرد It\'s Us', 890000, 'تومان', 1, 15, 'Black / Pink / Yellow', 'S,M,L,XL,XXL', '', '', '', '', 'تی‌شرت اورسایز صددرصد پنبه با چاپ سیلک برجسته', 2),
('tank', 'Distressed Painted Logo Tank Top', 'تاپ بدون آستین وینتیج', 750000, 'تومان', 1, 10, 'Black / Sand', 'S,M,L,XL', '', '', '', '', 'تاپ راحتی شسته شده به سبک وینتیج با لوگوی آرت ورک', 3),
('varsity', 'Snug Wrld Logo Varsity Jacket', 'ژاکت ورسیتی مشکی لوگودار', 2450000, 'تومان', 1, 4, 'Black', 'M,L,XL,XXL', '', '', '', '', 'کاپشن بیسبالی ورسیتی کژوال با آستر گرم و دوخت باکیفیت', 4),
('distressed-logo-t', 'Distressed Logo Print T-Shirt', 'تی‌شرت چاپی دیسترسد آبی', 920000, 'تومان', 1, 12, 'Blue', 'S,M,L,XL,XXL', '', '', '', '', 'تی‌شرت آستین کوتاه طرح کلاسیک با پارچه نرم و تنفس‌پذیر', 5),
('jersey', 'Snug Football Jersey', 'لباس ورزشی زرد/آبی فوتبالی', 1100000, 'تومان', 1, 7, 'Yellow / Blue', 'M,L,XL,XXL', '', '', '', '', 'پیراهن ورزشی استریت‌استایل با تن‌خور آزاد و جنس تنفس‌پذیر', 6),
('silicone-tee', 'Silicone Logo Print T-Shirt', 'تی‌شرت سیلیکونی سفید', 880000, 'تومان', 1, 9, 'White', 'S,M,L,XL', '', '', '', '', 'تی‌شرت یقه گرد مینیمال با پچ سیلیکونی برجسته', 7)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

SET FOREIGN_KEY_CHECKS = 1;
