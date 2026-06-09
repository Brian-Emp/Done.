<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$txt_brut = file_get_contents('php://input');
$task = json_decode($txt_brut, true);
if (!isset($task['title']) or trim($task['title'])=== '') {
    echo json_encode(['error' => 'Le champ "title" est requis.']);
    exit;
}
try {
    $stmt = $pdo->prepare('SELECT id FROM lists WHERE user_id = :user_id AND id = :id');
    $stmt->execute(['user_id' => $_SESSION['user_id'], 'id' => $_GET['list_id']]);
    $list = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("INSERT INTO tasks (title, user_id, list_id) VALUES (:title, :user_id, :list_id)");
    $bindparams = [':title' => $task['title'], ':user_id' => $_SESSION['user_id'], ':list_id' => $list['id']];
    $stmt->execute($bindparams);
    $id = $pdo->lastInsertId();
    $tab = ["success" => true, "id" => $id];
} catch (PDOException $e) {
    $tab = ["success" => false, "message" => $e->getMessage()];
}
header('Content-Type: application/json');
echo json_encode($tab);