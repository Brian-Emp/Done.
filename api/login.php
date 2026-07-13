<?php
session_start();
require_once 'config.php';

$txt_brut = file_get_contents('php://input');
$user = json_decode($txt_brut, true);
if (isset($user['email']) && isset($user['password']) && $user['email'] !== '' && $user['password'] !== '') {
    $email = $user['email'];
    $password = $user['password'];
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($result && password_verify($password, $result['password'])) {
            $_SESSION['user_id'] = $result['id'];
            $tab = (['success' => true, 'code' => 'login_success', 'message' => 'Login successful']);
        } else {
            $tab = (['success' => false, 'code' => 'login_invalid_credentials', 'message' => 'Invalid email or password']);
        }
    } catch (PDOException $e) {
        $tab = (['success' => false, 'code' => 'database_error', 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    $tab = (['success' => false, 'code' => 'login_missing_fields', 'message' => 'Email and password are required']);
}
header('Content-Type: application/json');
echo json_encode($tab);