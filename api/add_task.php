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
if (!isset($task['title']) or $task['title']=== '') {
    echo json_encode(['error' => 'Le champ "title" est requis.']);
    exit;
}
try {
    $stmt = $pdo->prepare("INSERT INTO tasks (title, user_id) VALUES (:title, :user_id)");
    $bindparams = [':title' => $task['title'], ':user_id' => $_SESSION['user_id']];
    $stmt->execute($bindparams);
    $id = $pdo->lastInsertId();
    $tab = ["success" => true, "id" => $id];
} catch (PDOException $e) {
    $tab = ["success" => false, "message" => $e->getMessage()];
}
header('Content-Type: application/json');
echo json_encode($tab);