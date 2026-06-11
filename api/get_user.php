<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
try {
    $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE id = :user_id");
    $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $tab = ['success' => true, 'user' => $user];
}
catch (PDOException $e) {
    http_response_code(500);
    $tab = ['success' => false, 'Database error: ' . $e->getMessage()];
}
header('Content-Type: application/json');
echo json_encode($tab);