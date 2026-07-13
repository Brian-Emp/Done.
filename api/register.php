<?php
require_once 'config.php';

$txt_brut = file_get_contents('php://input');
$user = json_decode($txt_brut, true);
if (isset($user['username']) && isset($user['password']) && isset($user['email']) && $user['username'] !== '' && $user['password'] !== '' && $user['email'] !== '') {
    $username = $user['username'];
    $email = $user['email'];
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $tab = (['success' => false, 'code' => 'register_invalid_email', 'message' => 'Invalid email format']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    // Validate password security
    if (strlen($user['password']) < 8) {
        $tab = (['success' => false, 'code' => 'password_too_short', 'message' => 'Password must be at least 8 characters long']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    if (!preg_match('/[A-Z]/', $user['password'])) {
        $tab = (['success' => false, 'code' => 'password_no_uppercase', 'message' => 'Password must contain at least one uppercase letter']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    if (!preg_match('/[a-z]/', $user['password'])) {
        $tab = (['success' => false, 'code' => 'password_no_lowercase', 'message' => 'Password must contain at least one lowercase letter']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    if (!preg_match('/[0-9]/', $user['password'])) {
        $tab = (['success' => false, 'code' => 'password_no_digit', 'message' => 'Password must contain at least one number']);
        header('Content-Type: application/json');
        echo json_encode($tab);
        exit;
    }
    $password = $user['password'];
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existingUser) {
        $tab = (['success' => false, 'code' => 'register_email_taken', 'message' => 'Email already exists']);
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
        $tab = (['success' => true, 'code' => 'register_success', 'message' => 'User registered successfully']);
    } catch (PDOException $e) {
        $tab = (['success' => false, 'code' => 'database_error', 'message' => 'Error: ' . $e->getMessage()]);
    }
} else {
    $tab = (['success' => false, 'code' => 'register_missing_fields', 'message' => 'Username and password are required']);
}
header('Content-Type: application/json');
echo json_encode($tab);