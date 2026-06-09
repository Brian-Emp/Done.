<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$list_id = $_GET['list_id'];
if (!is_numeric($list_id)) {
    $stmt = $pdo->prepare('SELECT id FROM lists WHERE user_id = :user_id AND name = "Général"');
    $stmt->execute(['user_id' => $_SESSION['user_id']]);
    $list = $stmt->fetch(PDO::FETCH_ASSOC);
    $list_id = $list['id'];
}

$stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = :user_id AND list_id = :list_id");
$stmt->bindParam(':user_id', $_SESSION['user_id']);
$stmt->bindParam(':list_id', $list_id);
$stmt->execute();
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
header('Content-Type: application/json');
echo json_encode($tasks);