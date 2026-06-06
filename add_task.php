<?php
require_once 'api/config.php';

$txt_brut = file_get_contents('php://input');
$task = json_decode($txt_brut, true);
if (!isset($task['title']) or $task['title']=== '') {
    echo json_encode(['error' => 'Le champ "title" est requis.']);
    exit;
}
try {
    $stmt = $pdo->prepare("INSERT INTO tasks (title) VALUES (:title)");
    $bindparams = [':title' => $task['title']];
    $stmt->execute($bindparams);
    $id = $pdo->lastInsertId();
    $tab = ["success" => true, "id" => $id];
} catch (PDOException $e) {
    $tab = ["success" => false, "message" => $e->getMessage()];
}
header('Content-Type: application/json');
echo json_encode($tab);