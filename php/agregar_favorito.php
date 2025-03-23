<?php
include_once 'conexion.php';

// Iniciar sesión para obtener el ID del usuario
session_start();

// Verificar si el usuario ha iniciado sesión
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Debes iniciar sesión para agregar favoritos']);
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

// Verificar si ya existe el registro para evitar duplicados
$sql_check = "SELECT * FROM canciones_megusta WHERE usuario_id = ? AND cancion_id = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("ii", $usuario_id, $cancion_id);
$stmt_check->execute();
$result = $stmt_check->get_result();

if ($result->num_rows > 0) {
    // Ya existe el registro, no es necesario añadirlo de nuevo
    echo json_encode(['success' => true, 'message' => 'La canción ya estaba en tus favoritos']);
    $stmt_check->close();
    $conn->close();
    exit;
}

// Insertar el nuevo registro en la tabla canciones_megusta
$sql_insert = "INSERT INTO canciones_megusta (usuario_id, cancion_id) VALUES (?, ?)";
$stmt_insert = $conn->prepare($sql_insert);
$stmt_insert->bind_param("ii", $usuario_id, $cancion_id);

if ($stmt_insert->execute()) {
    echo json_encode(['success' => true, 'message' => 'Canción agregada a favoritos']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al agregar a favoritos: ' . $conn->error]);
}

$stmt_check->close();
$stmt_insert->close();
$conn->close();
?>