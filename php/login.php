<?php
// Inicia la sesión
session_start();

// Incluye el archivo de conexión
require 'config.php'; 

// Verifica que la conexión esté disponible
if (!isset($conn) || $conn->connect_error) {
    error_log("Error de conexión a la base de datos: " . $conn->connect_error);
    header("Location: ../pages/login.html");
    exit();
}

// Procesa el formulario de inicio de sesión
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Verifica que los campos existan antes de usarlos
    if (!empty($_POST['email']) && !empty($_POST['password'])) {
        $email = trim($_POST['email']);
        $pass = $_POST['password']; 

        // Usa una consulta preparada para evitar inyecciones SQL
        $stmt = $conn->prepare("SELECT id, password_hash FROM usuarios WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows === 1) {
            $row = $result->fetch_assoc();

            // Verifica la contraseña con password_verify()
            if ($pass === $row['password_hash']) {
                // Necesitamos obtener el nombre del usuario
                $query = $conn->prepare("SELECT nombre FROM usuarios WHERE id = ?");
                $query->bind_param("i", $row['id']);
                $query->execute();
                $nombre_result = $query->get_result();
                
                if ($nombre_result && $nombre_result->num_rows === 1) {
                    $nombre_row = $nombre_result->fetch_assoc();
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['nombre'] = $nombre_row['nombre']; // Guardamos el nombre en la sesión
                } else {
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['nombre'] = "Usuario"; // Valor por defecto si no encontramos el nombre
                }
                
                $stmt->close();
                $conn->close();
                header("Location: ../pages/home.html");
                exit();
            }
        }

        // Si llega aquí, el login falló
        $stmt->close();
        $conn->close();
        echo "<script>alert('Credenciales incorrectas.'); window.location.href = '../pages/login.html';</script>";
        exit();
    }
}

// Cierra la conexión en caso de cualquier otro acceso inesperado
$conn->close();
?>
