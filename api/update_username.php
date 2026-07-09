<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    $tab = (['success' => false, 'message' => 'Unauthorized']);
    header('Content-Type: application/json');
    echo json_encode($tab);
    exit;
}
$txt_brut = file_get_contents('php://input');
$data = json_decode($txt_brut, true);

if (isset($data['username']) && trim($data['username']) !== '' ){
    $username = trim($data['username']);
    if (mb_strlen($username) > 255) {
        $tab = (['success' => false, 'message' => 'Username must be 255 characters or less']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    try {
        $stmt = $pdo->prepare("UPDATE users SET username = :username WHERE id = :user_id");
        $stmt->bindParam(':username', $username);
        $stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
        $stmt->execute();
        $tab = (['success' => true, 'message' => 'Username updated successfully', 'username' => $username]);
    } catch (PDOException $e) {
        $tab = (['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    $tab = (['success' => false, 'message' => 'Username is required']);
}

header('Content-Type: application/json');
echo json_encode($tab);