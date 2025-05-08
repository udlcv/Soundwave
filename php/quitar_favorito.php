<?php
include_once 'conexion.php';

// Iniciar sesión para obtener el ID del usuario
session_start();

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión para quitar favoritos']);
    exit;
}

// Obtener el ID del usuario y de la canción
$usuario_id = $_SESSION['user_id'];
$cancion_id = isset($_POST['cancion_id']) ? intval($_POST['cancion_id']) : 0;

// Validar que se recibió un ID de canción válido
if ($cancion_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de canción no válido']);
    exit;
}

// Eliminar el registro de la tabla canciones_megusta
$sql_delete = "DELETE FROM canciones_megusta WHERE usuario_id = ? AND cancion_id = ?";
$stmt_delete = $conn->prepare($sql_delete);
$stmt_delete->bind_param("ii", $usuario_id, $cancion_id);

if ($stmt_delete->execute()) {
    echo json_encode(['success' => true, 'message' => 'Canción eliminada de favoritos']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al eliminar de favoritos: ' . $conn->error]);
}

$stmt_delete->close();
$conn->close();
?>