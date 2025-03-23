<?php
// Configuración de la base de datos
$servername = "localhost"; // Cambia esto si no estás usando localhost
$username = "root";  // Tu nombre de usuario de la base de datos
$password = "";  // Tu contraseña de la base de datos
$database = "soundwave";  // Nombre de tu base de datos

// Crear la conexión
$conn = new mysqli($servername, $username, $password, $database);

// Verificar la conexión
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

//echo "¡Conexión exitosa!";

// Cierra la conexión al final si no la necesitas
//$conn->close();
?>
