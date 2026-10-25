<?php
/**
 * Image resolver inside _next directory for cPanel / Apache
 */
$url = isset($_GET['url']) ? $_GET['url'] : '';
$width = isset($_GET['w']) ? (int)$_GET['w'] : 0;

$products = [
    "crimson-memory"        => ["image-c6343cb74a71e8", "image-6c2a15e13730c8", "image-4e8640f03d7b6"],
    "distressed-logo-t"     => ["image-bb6fb99c4b2508", "image-c1471486a0b8a8", "image-05f55d455bb558"],
    "its-us-tee-black"      => ["image-b4ec065a4e66f8", "image-39f2c686e071e8", "image-b542c1d352ef8"],
    "jersey-yellow"         => ["image-6ae6766896f1d8", "image-a088f00edf1b58", "image-959fe759fcd068"],
    "silicone-tee"          => ["image-ffce5fea8389f8", "image-9f64af5d69fbe", "image-97e6e1449d26b"],
    "tank-black"            => ["image-0af2db7b4647a8", "image-9f9a2a06d674d8", "image-9efcd9db49e648"],
    "varsity"               => ["image-84bdfd6756b51",  "image-36c27604289f1", "image-d2f85dbbd1b6c8"],
    "jersey-blue"           => ["image-2406692edfcaf",  null,                  null],
    "tank-sand"             => ["image-246e6ad4aa26a8",  null,                  null],
    "its-us-tee-yellow"     => ["image-277d32b1ca5e88", null,                  null],
    "its-us-tee-bubblegum"  => ["image-ad7c33cd14d518", null,                  null],
];

function resolve_image($url, $width, $products) {
    if ($url === "/snug-wrld-logo.png") {
        return "image";
    }
    $basename = basename($url);
    $dotPos = strrpos($basename, '.');
    $name = ($dotPos !== false) ? substr($basename, 0, $dotPos) : $basename;

    foreach ($products as $slug => $imgs) {
        $prefix = $slug . "-";
        if (strpos($name, $prefix) === 0) {
            $view = substr($name, strlen($prefix));
            $large = $imgs[0];
            $small = $imgs[1];
            $side = $imgs[2];

            $front = ($small && $width <= 512) ? $small : $large;
            if ($view === "side") {
                return $side ? $side : $front;
            }
            return $front;
        }
    }
    return null;
}

$fname = resolve_image($url, $width, $products);
if ($fname) {
    $filePath = __DIR__ . "/" . $fname . ".html";
    if (file_exists($filePath)) {
        header("Content-Type: image/webp");
        header("Content-Length: " . filesize($filePath));
        header("Cache-Control: public, max-age=31536000");
        if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') {
            readfile($filePath);
        }
        exit;
    }
}

// Fallback checking parent directory
$parentImage = dirname(__DIR__) . '/image.php';
if (file_exists($parentImage)) {
    require $parentImage;
    exit;
}

http_response_code(404);
echo "Image not found";
