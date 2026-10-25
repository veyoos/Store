<?php
/**
 * API: Submit Customer Order
 * ثبت سفارش جدید مشتری در پایگاه داده
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'متد درخواست باید POST باشد.']);
    exit;
}

require_once __DIR__ . '/../config.php';

// خواندن اطلاعات ارسالی (JSON یا Form-data)
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST;
}

$customerName   = trim($input['name'] ?? $input['customer_name'] ?? '');
$customerPhone  = trim($input['phone'] ?? $input['customer_phone'] ?? '');
$customerAddress= trim($input['address'] ?? $input['customer_address'] ?? '');
$productTitle   = trim($input['product_title'] ?? $input['title'] ?? 'لباس از رگال');
$productId      = !empty($input['product_id']) ? (int)$input['product_id'] : null;
$notes          = trim($input['notes'] ?? '');

if (empty($customerName) || empty($customerPhone)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'لطفاً نام و شماره تماس خود را وارد نمایید.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$db = get_db();
if (!$db) {
    // در صورتی که دیتابیس وصل نباشد، سفارش را در یک فایل متنی لاگ می‌کنیم تا گم نشود
    $backupLog = date('Y-m-d H:i:s') . " | Name: $customerName | Phone: $customerPhone | Product: $productTitle | Address: $customerAddress\n";
    @file_put_contents(__DIR__ . '/../orders_backup.log', $backupLog, FILE_APPEND);

    echo json_encode([
        'success' => true,
        'message' => 'سفارش شما با موفقیت ثبت شد! کارشناسان ما به زودی با شما تماس خواهند گرفت.',
        'saved_to' => 'backup_log'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $db->prepare("INSERT INTO orders (product_id, product_title, customer_name, customer_phone, customer_address, notes, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->execute([$productId, $productTitle, $customerName, $customerPhone, $customerAddress, $notes]);
    $orderId = $db->lastInsertId();

    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'message' => 'سفارش شما با موفقیت ثبت شد! کارشناسان ما به زودی با شما تماس خواهند گرفت.'
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'خطا در ثبت سفارش: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
