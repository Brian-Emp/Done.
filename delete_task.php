<?php
require_once './api/config.php';

$txt_brut = file_get_contents('php://input');
$task = json_decode($txt_brut, true);
if (!isset($task['id']) or $task['id'] === '' or $task['id'] <= 0) {
    echo json_encode(['error' => 'Le champ "id" n\'est pas valide']);
    exit;
}
try {
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
    $bindparams = [':id' => $task['id']];
    $stmt->execute($bindparams);
    $tab = ["success" => true];
} catch (PDOException $e) {
    $tab = ["success" => false, "message" => $e->getMessage()];
}
header('Content-Type: application/json');
echo json_encode($tab);