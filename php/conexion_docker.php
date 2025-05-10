<?php
// Configuración para Docker (desarrollo)
$host = $_ENV['DB_HOST'] ?? 'db';
$port = $_ENV['DB_PORT'] ?? 3306;
$database = $_ENV['DB_NAME'] ?? 'railway';
$user = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? 'password';

// Crear la conexión
$conn = new mysqli($host, $user, $password, $database, $port);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Para desarrollo, puedes descomentar esta línea
// echo "Conexión exitosa a la base de datos en Docker!";
?>