<?php
// Detectar si estamos corriendo en Docker
$isDocker = isset($_ENV['DB_HOST']) && $_ENV['DB_HOST'] === 'db';

if ($isDocker) {
    // Configuración para Docker (desarrollo)
    $host = $_ENV['DB_HOST'];
    $port = $_ENV['DB_PORT'] ?? 3306;
    $database = $_ENV['DB_NAME'];
    $user = $_ENV['DB_USER'];
    $password = $_ENV['DB_PASSWORD'];
} else {
    // Configuración para Railway (producción)
    $host = "ballast.proxy.rlwy.net";
    $port = 38591;
    $database = "railway";
    $user = "root";
    $password = "uhsdmnOhOWgThimVsUwmUPoQIBmeJlBH";
}

// Crear la conexión
$conn = new mysqli($host, $user, $password, $database, $port);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Para debugging (descomenta en desarrollo)
// if ($isDocker) {
//     echo "Conexión exitosa a la base de datos en Docker!";
// } else {
//     echo "Conexión exitosa a la base de datos en Railway!";
// }
?>