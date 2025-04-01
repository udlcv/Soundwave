CREATE DATABASE soundwave;
USE soundwave;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE canciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255),
    artista VARCHAR(255),
    album VARCHAR(255),
    duracion INT, -- En segundos
    ruta VARCHAR(500), -- URL en la nube
    portada VARCHAR(500), -- URL de la imagen en la nube
    usuario_id INT, -- Quién subió la canción, puede ser NULL si no aplica
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nombre VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE playlist_canciones (
    playlist_id INT,
    cancion_id INT,
    PRIMARY KEY (playlist_id, cancion_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (cancion_id) REFERENCES canciones(id) ON DELETE CASCADE
);

CREATE TABLE canciones_megusta (
    usuario_id INT,
    cancion_id INT,
    fecha_megusta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, cancion_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cancion_id) REFERENCES canciones(id) ON DELETE CASCADE
);

CREATE TABLE cola_reproduccion (
    usuario_id INT,
    cancion_id INT,
    orden INT, -- Orden en la lista de reproducción
    PRIMARY KEY (usuario_id, orden),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (cancion_id) REFERENCES canciones(id) ON DELETE CASCADE
);
