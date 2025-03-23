<?php
// Inicia la sesión (opcional, por si luego necesitas usar variables de sesión)
session_start();

// Incluye la conexión a la base de datos
require 'conexion.php';

// Verifica que la conexión esté disponible
if (!isset($conn) || $conn->connect_error) {
    error_log("Error de conexión a la base de datos: " . $conn->connect_error);
    die("Error de conexión a la base de datos.");
}

// Procesa el formulario de registro
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Verifica que los campos no estén vacíos
    if (!empty($_POST['nombre']) && !empty($_POST['email']) && !empty($_POST['password']) && !empty($_POST['confirm_password'])) {
        $nombre = trim($_POST['nombre']);
        $email = trim($_POST['email']);
        $password = $_POST['password'];
        $confirm_password = $_POST['confirm_password'];

        // Verifica que las contraseñas coincidan
        if ($password !== $confirm_password) {
            echo "<script>alert('Las contraseñas no coinciden. Inténtalo de nuevo.'); window.location.href = '../pages/registro.html';</script>";
            exit();
        }

        // Hashea la contraseña para mayor seguridad
        //$password_hashed = password_hash($password, PASSWORD_DEFAULT);

        // Verifica si el correo ya está registrado
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            echo "<script>alert('Este correo ya está registrado. Usa otro.'); window.location.href = '../pages/registro.html';</script>";
            exit();
        }
        $stmt->close();

        // Inserta el usuario en la base de datos
        $stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $nombre, $email, $password);

        if ($stmt->execute()) {
            echo "<script>alert('Registro exitoso. Ahora puedes iniciar sesión.'); window.location.href = '../pages/login.html';</script>";
        } else {
            error_log("Error al registrar usuario: " . $stmt->error);
            echo "<script>alert('Error al registrar usuario. Inténtalo de nuevo.'); window.location.href = '../pages/sign_up.html';</script>";
        }

        $stmt->close();
        $conn->close();
        exit();
    } else {
        echo "<script>alert('Por favor, completa todos los campos.'); window.location.href = '../pages/sign_up.html';</script>";
    }
}

$conn->close();
?>
