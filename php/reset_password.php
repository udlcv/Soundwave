<?php
// Inicia la sesión
session_start();

// Incluye el archivo de conexión
require 'config.php';

// Verifica que la conexión esté disponible
if (!isset($conn) || $conn->connect_error) {
    error_log("Error de conexión a la base de datos: " . $conn->connect_error);
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión a la base de datos']);
    exit();
}

// Procesa el formulario de restablecimiento de contraseña
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Verifica que todos los campos necesarios existan
    if (!empty($_POST['token']) && !empty($_POST['password']) && !empty($_POST['confirm_password'])) {
        $token = $_POST['token'];
        $password = $_POST['password'];
        $confirm_password = $_POST['confirm_password'];
        
        // Valida que las contraseñas coincidan
        if ($password !== $confirm_password) {
            echo "<script>alert('Las contraseñas no coinciden.'); window.location.href = '../pages/reset_password.html?token=" . $token . "';</script>";
            exit();
        }
        
        // Verifica que la contraseña cumpla con los requisitos
        if (strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
            echo "<script>alert('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.'); window.location.href = '../pages/reset_password.html?token=" . $token . "';</script>";
            exit();
        }
        
        // Verifica que el token sea válido y no haya expirado
        $stmt = $conn->prepare("SELECT user_id, expires_at FROM password_reset_tokens WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows === 1) {
            $row = $result->fetch_assoc();
            $user_id = $row['user_id'];
            $expires_at = strtotime($row['expires_at']);
            $now = time();
            
            if ($now > $expires_at) {
                echo "<script>alert('El enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo.'); window.location.href = '../pages/forgot_password.html';</script>";
                $stmt->close();
                exit();
            }
            
            // Actualiza la contraseña del usuario
            // En un entorno real, deberías hashear la contraseña
            // pero siguiendo tu lógica original en login.php, no lo hacemos aquí