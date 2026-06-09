<?php
require_once 'config.php';

$txt_brut = file_get_contents('php://input');
$user = json_decode($txt_brut, true);
if (isset($user['username']) && isset($user['password']) && isset($user['email']) && $user['username'] !== '' && $user['password'] !== '' && $user['email'] !== '') {
    $username = $user['username'];
    $email = $user['email'];
    $password = $user['password'];
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existingUser) {
        $tab = (['success' => false, 'message' => 'Email already exists']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (:username, :email, :password_hash)");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password_hash', $password_hash);
        $stmt->execute();
        $tab = (['success' => true, 'message' => 'User registered successfully']);
    } catch (PDOException $e) {
        $tab = (['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    $tab = (['success' => false, 'message' => 'Username and password are required']);
}
header('Content-Type: application/json');
echo json_encode($tab);