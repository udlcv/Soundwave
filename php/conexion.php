<?php
$host = "ballast.proxy.rlwy.net"; // Ej: "monorail.proxy.rlwy.net"
$port = 38591; // O el puerto que te dé Railway
$database = "railway";
$user = "root";
$password = "uhsdmnOhOWgThimVsUwmUPoQIBmeJlBH";

// Crear la conexión
$conn = new mysqli($host, $user, $password, $database, $port);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
/*
echo "Conexión exitosa a la base de datos en Railway!";
*/
?>
