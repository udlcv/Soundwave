<?php
// Inicia la sesión
session_start();

// Incluye el archivo de conexión
require 'conexion.php';

// Verifica que la conexión esté disponible
if (!isset($conn) || $conn->connect_error) {
    error_log("Error de conexión a la base de datos: " . $conn->connect_error);
    header("Location: ../pages/forgot_password.html?error=db");
    exit();
}

// Procesa el formulario de recuperación de contraseña
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Verifica que el campo email exista
    if (!empty($_POST['email'])) {
        $email = trim($_POST['email']);
        
        // Verifica si el email existe en la base de datos
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result && $result->num_rows === 1) {
            $row = $result->fetch_assoc();
            $user_id = $row['id'];
            
            // Genera un token único
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));
            
            // Almacena el token en la base de datos
            // Primero, verifica si ya existe un token para este usuario y lo elimina
            $delete_stmt = $conn->prepare("DELETE FROM password_reset_tokens WHERE user_id = ?");
            $delete_stmt->bind_param("i", $user_id);
            $delete_stmt->execute();
            $delete_stmt->close();
            
            // Inserta el nuevo token
            $insert_stmt = $conn->prepare("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
            $insert_stmt->bind_param("iss", $user_id, $token, $expires);
            
            if ($insert_stmt->execute()) {
                // Envía el correo electrónico con el enlace de recuperación
                $reset_link = "http://" . $_SERVER['HTTP_HOST'] . "../pages/reset_password.html?token=" . $token;
                
                // Aquí deberías implementar el envío del correo
                // Por ahora, simplemente redirigimos con un mensaje de éxito
                
                $insert_stmt->close();
                $stmt->close();
                $conn->close();
                
                // En un entorno real, aquí iría el código para enviar el correo
                // Por ejemplo, usando la función mail() de PHP o una librería como PHPMailer
                
                // Esto es solo para fines de demostración, en producción se debería ocultar
                echo "<script>
                    alert('Se ha enviado un enlace de recuperación a tu correo electrónico.\\n\\nEnlace de recuperación: " . $reset_link . "');
                    window.location.href = '../pages/login.html';
                </script>";
                exit();
            } else {
                echo "<script>alert('Error al procesar la solicitud. Inténtalo de nuevo.'); window.location.href = '../pages/forgot_password.html';</script>";
            }
        } else {
            // No informamos si el email existe o no por seguridad
            echo "<script>alert('Si tu correo está registrado, recibirás instrucciones para restablecer tu contraseña.'); window.location.href = '../pages/login.html';</script>";
        }
        
        $stmt->close();
    }
}

// Cierra la conexión
$conn->close();

// Redirección por defecto si se accede directamente a este archivo
header("Location: ../pages/forgot_password.html");
exit();
?>