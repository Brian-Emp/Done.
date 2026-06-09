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
if (!isset($task['id']) or $task['id'] === '' or $task['id'] <= 0) {
    echo json_encode(['error' => 'Le champ "id" n\'est pas valide']);
    exit;
}
try {
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id AND user_id = :user_id");
    $bindparams = [':id' => $task['id'], ':user_id' => $_SESSION['user_id']];
    $stmt->execute($bindparams);
    $tab = ["success" => true];
} catch (PDOException $e) {
    $tab = ["success" => false, "message" => $e->getMessage()];
}
header('Content-Type: application/json');
echo json_encode($tab);