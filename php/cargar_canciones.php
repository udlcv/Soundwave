<?php
include_once 'conexion.php';

// Obtener el ID del usuario actual (desde la sesión)
session_start();
$usuario_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 0;

// Determinar si la solicitud requiere una respuesta JSON
$format_json = isset($_GET['format']) && $_GET['format'] === 'json';

// Consulta para obtener todas las canciones y verificar si están en "me gusta"
$sql = "SELECT c.id, c.titulo, c.artista, c.album, c.duracion, c.ruta, c.portada,
        (SELECT COUNT(*) FROM canciones_megusta WHERE usuario_id = ? AND cancion_id = c.id) AS es_favorita
        FROM canciones c 
        ORDER BY c.titulo ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

// Si se requiere formato JSON
if ($format_json) {
    $canciones = [];
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            // Convertir duración de segundos a formato mm:ss
            $minutos = floor($row["duracion"] / 60);
            $segundos = $row["duracion"] % 60;
            $duracion_formateada = sprintf("%d:%02d", $minutos, $segundos);
            
            // Ruta local del archivo
            $ruta_audio = "../music/" . basename($row["ruta"]);
            
            // Ruta de la portada o usar una por defecto
            $portada = !empty($row["portada"]) ? "../assets/portadas/" . basename($row["portada"]) : "../assets/portadas/default-album.jpg";
            
            // Determinar si la canción está en favoritos
            $icono_favorito = ($row["es_favorita"] > 0) ? "❤️" : "♡";
            $clase_favorito = ($row["es_favorita"] > 0) ? "me-gusta-btn activo" : "me-gusta-btn";
            
            $html = '<tr>
                <td><img src="' . $portada . '" class="album-cover" alt="Portada" style="width: 60px; height: 60px; object-fit: cover;"></td>
                <td>' . $row["titulo"] . '</td>
                <td>' . $row["artista"] . '</td>
                <td>' . $row["album"] . '</td>
                <td>' . $duracion_formateada . '</td>
                <td>
                    <button class="play-btn" 
                        data-ruta="' . $ruta_audio . '" 
                        data-titulo="' . $row["titulo"] . '" 
                        data-artista="' . $row["artista"] . '"
                        data-portada="' . $portada . '">
                        ▶ Reproducir
                    </button>
                    <button class="' . $clase_favorito . '" data-id="' . $row["id"] . '">
                        ' . $icono_favorito . ' Me gusta
                    </button>
                </td>
            </tr>';
            
            $canciones[] = [
                'id' => $row["id"],
                'titulo' => $row["titulo"],
                'artista' => $row["artista"],
                'album' => $row["album"],
                'duracion' => $duracion_formateada,
                'ruta' => $ruta_audio,
                'portada' => $portada,
                'es_favorita' => ($row["es_favorita"] > 0),
                'html' => $html
            ];
        }
        echo json_encode(['success' => true, 'message' => 'Canciones cargadas con éxito', 'canciones' => $canciones]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se encontraron canciones']);
    }
} else {
    // Formato HTML (comportamiento original)
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            // Convertir duración de segundos a formato mm:ss
            $minutos = floor($row["duracion"] / 60);
            $segundos = $row["duracion"] % 60;
            $duracion_formateada = sprintf("%d:%02d", $minutos, $segundos);
            
            // Ruta local del archivo
            $ruta_audio = "../music/" . basename($row["ruta"]);
            
            // Ruta de la portada o usar una por defecto
            $portada = !empty($row["portada"]) ? "../assets/portadas/" . basename($row["portada"]) : "../assets/portadas/default-album.jpg";
            
            // Determinar si la canción está en favoritos
            $icono_favorito = ($row["es_favorita"] > 0) ? "❤️" : "♡";
            $clase_favorito = ($row["es_favorita"] > 0) ? "me-gusta-btn activo" : "me-gusta-btn";
            
            echo '<tr>
                <td><img src="' . $portada . '" class="album-cover" alt="Portada" style="width: 60px; height: 60px; object-fit: cover;"></td>
                <td>' . $row["titulo"] . '</td>
                <td>' . $row["artista"] . '</td>
                <td>' . $row["album"] . '</td>
                <td>' . $duracion_formateada . '</td>
                <td>
                    <button class="play-btn" 
                        data-ruta="' . $ruta_audio . '" 
                        data-titulo="' . $row["titulo"] . '" 
                        data-artista="' . $row["artista"] . '"
                        data-portada="' . $portada . '">
                        ▶ Reproducir
                    </button>
                    <button class="' . $clase_favorito . '" data-id="' . $row["id"] . '">
                        ' . $icono_favorito . ' Me gusta
                    </button>
                </td>
            </tr>';
        }
    } else {
        echo '<tr><td colspan="6">No se encontraron canciones</td></tr>';
    }
}

$stmt->close();
$conn->close();
?>