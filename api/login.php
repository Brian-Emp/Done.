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
            $tab = (['success' => true, 'message' => 'Login successful']);
        } else {
            $tab = (['success' => false, 'message' => 'Invalid email or password']);
        }
    } catch (PDOException $e) {
        $tab = (['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    $tab = (['success' => false, 'message' => 'Email and password are required']);
}
header('Content-Type: application/json');
echo json_encode($tab);