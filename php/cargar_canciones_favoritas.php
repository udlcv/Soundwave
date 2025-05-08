<?php
include_once 'conexion.php';

// Obtener el ID del usuario actual (desde la sesión)
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../pages/login.html");
    exit();
}
$usuario_id = $_SESSION['user_id'];

// Consulta para obtener solo las canciones marcadas como "me gusta" por el usuario actual
$sql = "SELECT c.id, c.titulo, c.artista, c.album, c.duracion, c.ruta, c.portada
        FROM canciones c 
        JOIN canciones_megusta m ON c.id = m.cancion_id
        WHERE m.usuario_id = ?
        ORDER BY c.titulo ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Ruta local del archivo
        $ruta_audio = "../music/" . basename($row["ruta"]);
        
        // Ruta de la portada o usar una por defecto
        $portada = !empty($row["portada"]) ? "../assets/portadas/" . basename($row["portada"]) : "../assets/portadas/default-album.jpg";
        
        // Formatear la duración de segundos a minutos:segundos
        $minutos = floor($row["duracion"] / 60);
        $segundos = $row["duracion"] % 60;
        $duracion_formateada = sprintf("%d:%02d", $minutos, $segundos);
        
        echo '<tr>
                <td>
                    <img src="' . $portada . '" alt="Portada" class="album-thumbnail" style="width: 50px; height: 50px;">
                </td>
                <td>' . $row["titulo"] . '</td>
                <td>' . $row["artista"] . '</td>
                <td>' . $row["album"] . '</td>
                <td>' . $duracion_formateada . '</td>
                <td class="actions-column">
                    <button class="btn btn-reproducir" data-ruta="' . $ruta_audio . '" 
                        data-titulo="' . $row["titulo"] . '" 
                        data-artista="' . $row["artista"] . '"
                        data-portada="' . $portada . '">
                        <i class="fas fa-play"></i> Reproducir
                    </button>
                </td>
              </tr>';
    }
} else {
    echo '<tr><td colspan="6" class="mensaje-vacio">Aún no tienes canciones favoritas</td></tr>';
}
$stmt->close();
$conn->close();
?>