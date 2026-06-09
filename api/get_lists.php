<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}
try {
    $stmt = $pdo->prepare('SELECT id, name FROM lists WHERE user_id = :user_id');
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $lists = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $tab = ["success" => true, "lists" => $lists];
} catch (PDOException $e) {
    http_response_code(500);
    $tab = ["success" => false, "message" => $e->getMessage()];
    exit;
}
echo json_encode($tab);