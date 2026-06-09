<?php
if (session_status() == PHP_SESSION_NONE){
    session_start();
}
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$donneesBrutes = file_get_contents("php://input");
$donnees = json_decode($donneesBrutes, true);
try {
    $stmt = $pdo->prepare("DELETE FROM lists WHERE id = :id AND user_id = :user_id");
    $stmt->bindParam(':id', $donnees['id'], PDO::PARAM_INT);
    $stmt->bindParam(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();
    $tab = ['success' => true, 'message' => 'La liste a été supprimée avec succès.'];
} catch (PDOException $e) {
    $tab = ['success' => false, 'message' => $e->getMessage()];
}
echo json_encode($tab);