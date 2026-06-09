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
$list = json_decode($txt_brut, true);
if (!isset($list['name']) or $list['name']=== '') {
    echo json_encode(['error' => 'Le champ "name" est requis.']);
    exit;
}
try {
    $stmt = $pdo->prepare("INSERT INTO lists (name, user_id) VALUES (:name, :user_id)");
    $bindparams = [':name' => $list['name'], ':user_id' => $_SESSION['user_id']];
    $stmt->execute($bindparams);
    $id = $pdo->lastInsertId();
    $tab = ["success" => true, "id" => $id];
} catch (PDOException $e) {
    $tab = ["success" => false, "message" => $e->getMessage()];
}
header('Content-Type: application/json');
echo json_encode($tab);