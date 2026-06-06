<?php
$host = 'localhost';
$port = '8889'; // Le port MAMP Mac
$dbname = 'Done.';
$username = 'YoUR_USERNAME_HERE';
$password = 'YOUR_PASSWORD_HERE'; 

try {
    // Le DSN (Data Source Name) qui indique où et comment se connecter
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    
    // Règle d'or : On force PDO à afficher des exceptions en cas d'erreur SQL
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch (PDOException $e) {
    // Si MAMP est éteint ou le mot de passe faux, on coupe tout
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}
?>