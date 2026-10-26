<?php
/**
 * API: Get Products & Store Settings
 * خروجی لیست محصولات و تنظیمات فروشگاه با فرمت JSON
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../config.php';

$response = [
    'success' => true,
    'source' => 'static', // 'database' or 'static'
    'settings' => [
        'store_title' => 'فروشگاه رگال لباس | Fancy Clothes',
        'marquee_text' => 'IT\'S US, NEVER THEM  •  NEW DROPS  •  کالکشن جدید لباس  •  ارسال به سراسر کشور',
        'contact_phone' => '09120000000',
        'instagram' => '@store_iran',
        'telegram' => '@store_iran'
    ],
    'products' => []
];

// لیست پیش‌فرض پشتیبان در صورتی که دیتابیس هنوز وصل نشده باشد
$defaultProducts = [
    [
        'id' => 1,
        'slug' => 'crimson-memory',
        'title' => 'Crimson Memory LS Shirt',
        'title_fa' => 'پیراهن آستین بلند کریمسون',
        'price' => 1250000,
        'currency' => 'تومان',
        'is_available' => 1,
        'stock_quantity' => 8,
        'color' => 'White',
        'sizes' => 'S,M,L,XL,XXL',
        'colourways' => '',
        'buy_url' => '',
        'front_image' => '',
        'side_image' => '',
        'back_image' => '',
        'description' => 'پیراهن آستین بلند نخی با کیفیت عالی و دوخت سفارشی'
    ],
    [
        'id' => 2,
        'slug' => 'its-us-tee',
        'title' => "It's Us Never Them Tee",
        'title_fa' => 'تی‌شرت مشکی/صورتی/زرد It\'s Us',
        'price' => 890000,
        'currency' => 'تومان',
        'is_available' => 1,
        'stock_quantity' => 15,
        'color' => 'Black / Pink / Yellow',
        'sizes' => 'S,M,L,XL,XXL',
        'colourways' => [
            ['label' => 'Black', 'hex' => '#1e1e1e', 'front' => '/products/its-us-tee-black-front.webp', 'side' => '/products/its-us-tee-black-side.webp'],
            ['label' => 'Pink', 'hex' => '#f6b1b4', 'front' => '/products/its-us-tee-bubblegum-front.webp', 'side' => '/products/its-us-tee-bubblegum-side.webp'],
            ['label' => 'Yellow', 'hex' => '#f8dd2f', 'front' => '/products/its-us-tee-yellow-front.webp', 'side' => '/products/its-us-tee-yellow-side.webp']
        ],
        'buy_url' => '',
        'front_image' => '',
        'side_image' => '',
        'back_image' => '',
        'description' => 'تی‌شرت اورسایز صددرصد پنبه با چاپ سیلک برجسته'
    ],
    [
        'id' => 3,
        'slug' => 'tank',
        'title' => 'Distressed Painted Logo Tank Top',
        'title_fa' => 'تاپ بدون آستین وینتیج',
        'price' => 750000,
        'currency' => 'تومان',
        'is_available' => 1,
        'stock_quantity' => 10,
        'color' => 'Black / Sand',
        'sizes' => 'S,M,L,XL',
        'colourways' => [
            ['label' => 'Black', 'hex' => '#2d2d2c', 'front' => '/products/tank-black-front.webp', 'side' => '/products/tank-black-side.webp'],
            ['label' => 'Sand', 'hex' => '#b29e8b', 'front' => '/products/tank-sand-front.webp', 'side' => '/products/tank-sand-side.webp']
        ],
        'buy_url' => '',
        'front_image' => '',
        'side_image' => '',
        'back_image' => '',
        'description' => 'تاپ راحتی شسته شده به سبک وینتیج با لوگوی آرت ورک'
    ],
    [
        'id' => 4,
        'slug' => 'varsity',
        'title' => 'Snug Wrld Logo Varsity Jacket',
        'title_fa' => 'ژاکت ورسیتی مشکی لوگودار',
        'price' => 2450000,
        'currency' => 'تومان',
        'is_available' => 1,
        'stock_quantity' => 4,
        'color' => 'Black',
        'sizes' => 'M,L,XL,XXL',
        'colourways' => '',
        'buy_url' => '',
        'front_image' => '',
        'side_image' => '',
        'back_image' => '',
        'description' => 'کاپشن بیسبالی ورسیتی کژوال با آستر گرم و دوخت باکیفیت'
    ],
    [
        'id' => 5,
        'slug' => 'distressed-logo-t',
        'title' => 'Distressed Logo Print T-Shirt',
        'title_fa' => 'تی‌شرت چاپی دیسترسد آبی',
        'price' => 920000,
        'currency' => 'تومان',
        'is_available' => 1,
        'stock_quantity' => 12,
        'color' => 'Blue',
        'sizes' => 'S,M,L,XL,XXL',
        'colourways' => '',
        'buy_url' => '',
        'front_image' => '',
        'side_image' => '',
        'back_image' => '',
        'description' => 'تی‌شرت آستین کوتاه طرح کلاسیک با پارچه نرم و تنفس‌پذیر'
    ],
    [
        'id' => 6,
        'slug' => 'jersey',
        'title' => 'Snug Football Jersey',
        'title_fa' => 'لباس ورزشی زرد/آبی فوتبالی',
        'price' => 1100000,
        'currency' => 'تومان',
        'is_available' => 1,
        'stock_quantity' => 7,
        'color' => 'Yellow / Blue',
        'sizes' => 'M,L,XL,XXL',
        'colourways' => [
            ['label' => 'Yellow', 'hex' => '#e3ca1e', 'front' => '/products/jersey-yellow-front.webp', 'side' => '/products/jersey-yellow-side.webp'],
            ['label' => 'Blue', 'hex' => '#0842a9', 'front' => '/products/jersey-blue-front.webp', 'side' => '/products/jersey-blue-side.webp']
        ],
        'buy_url' => '',
        'front_image' => '',
        'side_image' => '',
        'back_image' => '',
        'description' => 'پیراهن ورزشی استریت‌استایل با تن‌خور آزاد و جنس تنفس‌پذیر'
    ],
    [
        'id' => 7,
        'slug' => 'silicone-tee',
        'title' => 'Silicone Logo Print T-Shirt',
        'title_fa' => 'تی‌شرت سیلیکونی سفید',
        'price' => 880000,
        'currency' => 'تومان',
        'is_available' => 1,
        'stock_quantity' => 9,
        'color' => 'White',
        'sizes' => 'S,M,L,XL',
        'colourways' => '',
        'buy_url' => '',
        'front_image' => '',
        'side_image' => '',
        'back_image' => '',
        'description' => 'تی‌شرت یقه گرد مینیمال با پچ سیلیکونی برجسته'
    ]
];

$db = get_db();
if ($db) {
    try {
        // دریافت تنظیمات
        $stmt = $db->query("SELECT setting_key, setting_value FROM settings");
        while ($row = $stmt->fetch()) {
            $response['settings'][$row['setting_key']] = $row['setting_value'];
        }

        // دریافت محصولات
        $stmt = $db->query("SELECT * FROM products ORDER BY sort_order ASC, id ASC");
        $dbProducts = $stmt->fetchAll();
        if (!empty($dbProducts)) {
            $response['products'] = array_map(function($p) {
                $p['price'] = (int)$p['price'];
                $p['is_available'] = (int)$p['is_available'];
                $p['stock_quantity'] = (int)$p['stock_quantity'];
                $p['formatted_price'] = number_format($p['price']) . ' ' . $p['currency'];
                $p['sizes'] = !empty($p['sizes']) ? $p['sizes'] : 'S,M,L,XL,XXL';
                if (!empty($p['front_image'])) {
                    $p['image_url'] = $p['front_image'];
                } else {
                    $p['image_url'] = '_next/image?url=%2Fproducts%2F' . urlencode($p['slug']) . '-front.webp&w=640&q=75';
                }
                return $p;
            }, $dbProducts);
            $response['source'] = 'database';
        } else {
            $response['products'] = $defaultProducts;
        }
    } catch (Exception $e) {
        $response['products'] = $defaultProducts;
        $response['db_error'] = $e->getMessage();
    }
} else {
    $response['products'] = array_map(function($p) {
        $p['formatted_price'] = number_format($p['price']) . ' ' . $p['currency'];
        $p['image_url'] = '_next/image?url=%2Fproducts%2F' . urlencode($p['slug']) . '-front.webp&w=640&q=75';
        return $p;
    }, $defaultProducts);
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
