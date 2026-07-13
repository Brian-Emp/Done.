<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';
if (!isset($_SESSION['user_id'])) {
    $tab = (['success' => false, 'code' => 'unauthorized', 'message' => 'Unauthorized']);
    header('Content-Type: application/json');
    echo json_encode($tab);
    exit;
}
$txt_brut = file_get_contents('php://input');
$user = json_decode($txt_brut, true);

if (isset($user['oldPassword']) && isset($user['newPassword']) && $user['oldPassword'] !== '' && $user['newPassword'] !== '') {
    $oldPassword = $user['oldPassword'];
    $newPassword = $user['newPassword'];
    // Validate password security
    if (strlen($newPassword) < 8) {
        $tab = (['success' => false, 'code' => 'password_too_short', 'message' => 'Password must be at least 8 characters long']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    if (!preg_match('/[A-Z]/', $newPassword)) {
        $tab = (['success' => false, 'code' => 'password_no_uppercase', 'message' => 'Password must contain at least one uppercase letter']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    if (!preg_match('/[a-z]/', $newPassword)) {
        $tab = (['success' => false, 'code' => 'password_no_lowercase', 'message' => 'Password must contain at least one lowercase letter']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    if (!preg_match('/[0-9]/', $newPassword)) {
        $tab = (['success' => false, 'code' => 'password_no_digit', 'message' => 'Password must contain at least one number']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    //good old password validation
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = :user_id");
    $stmt->bindParam(':user_id', $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$result || !password_verify($oldPassword, $result['password'])) {
        $tab = (['success' => false, 'code' => 'password_wrong_old', 'message' => 'Incorrect current password']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    // Hash the new password and update it in the db
    $password_hash = password_hash($newPassword, PASSWORD_BCRYPT);
    try {
        $stmt = $pdo->prepare("UPDATE users SET password = :password_hash WHERE id = :user_id");
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->bindParam(':user_id', $_SESSION['user_id']);
        $stmt->execute();
        session_regenerate_id(true); // Regenerate session ID to prevent session fixation
        $tab = (['success' => true, 'code' => 'password_updated', 'message' => 'Password updated successfully']);
    } catch (PDOException $e) {
        $tab = (['success' => false, 'code' => 'database_error', 'message' => 'Error updating password: ' . $e->getMessage()]);
    }
} else {
    $tab = (['success' => false, 'code' => 'password_required', 'message' => 'Password is required']);
}

header('Content-Type: application/json');
echo json_encode($tab);