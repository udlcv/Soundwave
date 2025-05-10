 // Variables globales
        let currentPlaylist = [];
        let allSongs = []; // Array para almacenar todas las canciones de la BD
        let currentTrackIndex = 0;
        let isPlaying = false;
        let currentVolume = 0.7;
        let isShuffled = false;
        let repeatMode = 'off'; // 'off', 'all', 'one'

        // Elementos del DOM
        const audio = document.getElementById('main-audio');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const playPauseIcon = document.getElementById('play-pause-icon');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const shuffleBtn = document.getElementById('shuffle-btn');
        const repeatBtn = document.getElementById('repeat-btn');
        const progressBar = document.getElementById('progress-bar');
        const progressFilled = document.getElementById('progress-filled');
        const progressBuffer = document.getElementById('progress-buffer');
        const progressHandle = document.getElementById('progress-handle');
        const currentTimeLabel = document.getElementById('current-time');
        const totalTimeLabel = document.getElementById('total-time');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeLevel = document.getElementById('volume-level');
        const volumeHandle = document.getElementById('volume-handle');
        const volumeIcon = document.getElementById('volume-icon');

        // Inicialización
        function initializePlayer() {
            // Configurar volumen inicial
            audio.volume = currentVolume;
            updateVolumeUI();
            
            // Eventos de audio - asegura que los iconos se actualicen correctamente
            audio.addEventListener('loadedmetadata', updateTimeDisplay);
            audio.addEventListener('timeupdate', updateProgress);
            audio.addEventListener('progress', updateBuffer);
            audio.addEventListener('ended', handleTrackEnd);
            
            // Eventos de estado de reproducción
            audio.addEventListener('play', () => {
                isPlaying = true;
                playPauseIcon.className = 'fas fa-pause';
                console.log('Audio playing - Icon changed to pause');
            });
            
            audio.addEventListener('pause', () => {
                isPlaying = false;
                playPauseIcon.className = 'fas fa-play';
                console.log('Audio paused - Icon changed to play');
            });
            
            audio.addEventListener('waiting', () => {
                console.log('Audio waiting/buffering');
            });
            
            audio.addEventListener('canplay', () => {
                console.log('Audio can play');
            });
            
            // Eventos de controles
            playPauseBtn.addEventListener('click', togglePlayPause);
            prevBtn.addEventListener('click', playPreviousTrack);
            nextBtn.addEventListener('click', playNextTrack);
            shuffleBtn.addEventListener('click', toggleShuffle);
            repeatBtn.addEventListener('click', toggleRepeat);
            
            // Eventos de progreso
            progressBar.addEventListener('click', seekToPosition);
            progressBar.addEventListener('mousedown', startDragging);
            
            // Eventos de volumen
            volumeSlider.addEventListener('click', setVolume);
            volumeIcon.addEventListener('click', toggleMute);
        }

        // Función para reproducir una canción
        function reproducirCancion(ruta, titulo, artista, portada) {
            // Encontrar la canción en la playlist actual
            const trackIndex = currentPlaylist.findIndex(track => track.ruta === ruta);
            if (trackIndex !== -1) {
                currentTrackIndex = trackIndex;
            } else {
                // Si no está en la playlist, agregarla
                currentPlaylist.push({ ruta, titulo, artista, portada });
                currentTrackIndex = currentPlaylist.length - 1;
            }
            
            loadTrack(currentTrackIndex);
            playTrack();
        }

        // Cargar una pista
        function loadTrack(index) {
            if (currentPlaylist[index]) {
                const track = currentPlaylist[index];
                
                // Pausar la pista actual antes de cargar nueva
                audio.pause();
                
                // Actualizar la interfaz
                document.getElementById('reproductor-titulo').textContent = track.titulo;
                document.getElementById('reproductor-artista').textContent = track.artista;
                document.getElementById('reproductor-portada').src = track.portada || '../assets/portadas/default-album.jpg';
                document.getElementById('reproductor-background').style.backgroundImage = `url(${track.portada || '../assets/portadas/default-album.jpg'})`;
                
                // Cargar el audio
                audio.src = track.ruta;
                audio.load();
                
                // Resetear el icono al cargar nueva pista
                isPlaying = false;
                playPauseIcon.className = 'fas fa-play';
                
                // Mostrar el reproductor
                document.getElementById('reproductor-container').style.display = 'block';
            }
        }

        // Reproducir pista
        function playTrack() {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Se reproducirá correctamente
                    isPlaying = true;
                    playPauseIcon.className = 'fas fa-pause';
                }).catch(error => {
                    console.error('Error al reproducir:', error);
                    // Mantener el estado en pausa
                    isPlaying = false;
                    playPauseIcon.className = 'fas fa-play';
                });
            }
        }

        // Control play/pause
        function togglePlayPause() {
            // Actualizar el estado inmediatamente para evitar retrasos
            if (isPlaying || !audio.paused) {
                audio.pause();
                isPlaying = false;
                playPauseIcon.className = 'fas fa-play';
            } else {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        isPlaying = true;
                        playPauseIcon.className = 'fas fa-pause';
                    }).catch(error => {
                        console.error('Error al reproducir:', error);
                        // Mantener el estado en play
                        isPlaying = false;
                        playPauseIcon.className = 'fas fa-play';
                    });
                }
            }
        }

        // Pista anterior
        function playPreviousTrack() {
            if (audio.currentTime > 3) {
                // Si la canción ha estado reproduciéndose por más de 3 segundos, reiniciarla
                audio.currentTime = 0;
            } else {
                // Ir a la pista anterior
                if (isShuffled) {
                    currentTrackIndex = Math.floor(Math.random() * currentPlaylist.length);
                } else {
                    currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
                }
                loadTrack(currentTrackIndex);
                if (isPlaying) playTrack();
            }
        }

        // Pista siguiente
        function playNextTrack() {
            if (isShuffled) {
                currentTrackIndex = Math.floor(Math.random() * currentPlaylist.length);
            } else {
                currentTrackIndex = (currentTrackIndex + 1) % currentPlaylist.length;
            }
            loadTrack(currentTrackIndex);
            if (isPlaying) playTrack();
        }

        // Final de la pista
        function handleTrackEnd() {
            // Resetear estado antes de continuar
            isPlaying = false;
            playPauseIcon.className = 'fas fa-play';
            
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                playTrack();
            } else if (repeatMode === 'all' || currentTrackIndex < currentPlaylist.length - 1) {
                playNextTrack();
            } else {
                // Final de la playlist
                isPlaying = false;
                playPauseIcon.className = 'fas fa-play';
            }
        }

        // Toggle shuffle
        function toggleShuffle() {
            isShuffled = !isShuffled;
            shuffleBtn.style.color = isShuffled ? '#1db954' : 'rgba(255, 255, 255, 0.8)';
        }

        // Toggle repeat
        function toggleRepeat() {
            const modes = ['off', 'all', 'one'];
            const currentIndex = modes.indexOf(repeatMode);
            repeatMode = modes[(currentIndex + 1) % modes.length];
            
            const icon = repeatBtn.querySelector('i');
            switch (repeatMode) {
                case 'off':
                    repeatBtn.style.color = 'rgba(255, 255, 255, 0.8)';
                    icon.className = 'fas fa-redo';
                    break;
                case 'all':
                    repeatBtn.style.color = '#1db954';
                    icon.className = 'fas fa-redo';
                    break;
                case 'one':
                    repeatBtn.style.color = '#1db954';
                    icon.className = 'fas fa-redo';
                    // Añadir un pequeño punto para indicar repeat one
                    if (!repeatBtn.querySelector('.repeat-dot')) {
                        const dot = document.createElement('span');
                        dot.className = 'repeat-dot';
                        dot.style.fontSize = '8px';
                        dot.style.position = 'absolute';
                        dot.style.marginLeft = '2px';
                        dot.textContent = '•';
                        icon.after(dot);
                    }
                    break;
            }
            
            if (repeatMode !== 'one' && repeatBtn.querySelector('.repeat-dot')) {
                repeatBtn.querySelector('.repeat-dot').remove();
            }
        }

        // Actualizar visualización del tiempo
        function updateTimeDisplay() {
            totalTimeLabel.textContent = formatTime(audio.duration);
        }

        // Función para sincronizar el estado del botón
        function syncPlayPauseButton() {
            if (audio.paused) {
                isPlaying = false;
                playPauseIcon.className = 'fas fa-play';
            } else {
                isPlaying = true;
                playPauseIcon.className = 'fas fa-pause';
            }
        }
        
        // Asegurar sincronización cada vez que se actualiza el progreso
        function updateProgress() {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressFilled.style.width = `${percent}%`;
            progressHandle.style.left = `${percent}%`;
            currentTimeLabel.textContent = formatTime(audio.currentTime);
            
            // Sincronizar el botón play/pause en cada actualización
            syncPlayPauseButton();
        }

        // Actualizar buffer
        function updateBuffer() {
            if (audio.buffered.length > 0) {
                const percent = (audio.buffered.end(audio.buffered.length - 1) / audio.duration) * 100;
                progressBuffer.style.width = `${percent}%`;
            }
        }

        // Formatear tiempo
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        // Buscar en la barra de progreso
        function seekToPosition(e) {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
        }

        // Iniciar arrastre de progreso
        let isDragging = false;
        function startDragging(e) {
            isDragging = true;
            seekToPosition(e);
            
            document.addEventListener('mousemove', continueDragging);
            document.addEventListener('mouseup', stopDragging);
        }

        function continueDragging(e) {
            if (isDragging) {
                seekToPosition(e);
            }
        }

        function stopDragging() {
            isDragging = false;
            document.removeEventListener('mousemove', continueDragging);
            document.removeEventListener('mouseup', stopDragging);
        }

        // Control de volumen
        function setVolume(e) {
            const rect = volumeSlider.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            currentVolume = Math.max(0, Math.min(1, percent));
            audio.volume = currentVolume;
            updateVolumeUI();
        }

        function updateVolumeUI() {
            const percent = currentVolume * 100;
            volumeLevel.style.width = `${percent}%`;
            volumeHandle.style.left = `${percent}%`;
            
            if (currentVolume === 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (currentVolume < 0.4) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
        }

        function toggleMute() {
            if (currentVolume > 0) {
                volumeIcon.dataset.lastVolume = currentVolume;
                currentVolume = 0;
            } else {
                currentVolume = parseFloat(volumeIcon.dataset.lastVolume || 0.7);
            }
            audio.volume = currentVolume;
            updateVolumeUI();
        }

        // Cargar canciones desde la base de datos
        function cargarCancionesDesdeDB() {
            fetch('../php/cargar_canciones.php?format=json')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Convertir la estructura de tu BD al formato que necesita el reproductor
                        allSongs = data.canciones.map(cancion => ({
                            id: cancion.id,
                            ruta: cancion.ruta,
                            titulo: cancion.titulo,
                            artista: cancion.artista,
                            album: cancion.album,
                            duracion: cancion.duracion,
                            portada: cancion.portada || '../assets/portadas/default-album.jpg'
                        }));
                        
                        // Por defecto, la playlist es todas las canciones
                        currentPlaylist = [...allSongs];
                        
                        console.log('Canciones cargadas:', allSongs.length);
                    } else {
                        console.error('Error al cargar canciones:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error en la petición de canciones:', error);
                });
        }

        // Modificar la función reproducirCancion para usar el ID
        function reproducirCancionPorId(cancionId) {
            const trackIndex = currentPlaylist.findIndex(track => track.id == cancionId);
            if (trackIndex !== -1) {
                currentTrackIndex = trackIndex;
                loadTrack(currentTrackIndex);
                playTrack();
            } else {
                console.error('Canción no encontrada en la playlist actual');
            }
        }

        // Función para crear playlist personalizada
        function crearPlaylistDesde(cancionId) {
            const cancionActual = allSongs.find(song => song.id == cancionId);
            if (cancionActual) {
                // Obtener el índice de la canción en todas las canciones
                const indiceEnTodas = allSongs.findIndex(song => song.id == cancionId);
                
                // Crear playlist comenzando desde la canción seleccionada
                currentPlaylist = [
                    ...allSongs.slice(indiceEnTodas),
                    ...allSongs.slice(0, indiceEnTodas)
                ];
                
                currentTrackIndex = 0;
                loadTrack(currentTrackIndex);
                playTrack();
            }
        }

        // Exponer funciones globalmente
        window.reproducirCancion = function(ruta, titulo, artista, portada) {
            // Buscar la canción en allSongs por la ruta
            const song = allSongs.find(s => s.ruta === ruta);
            if (song) {
                // Crear playlist desde esta canción
                crearPlaylistDesde(song.id);
            } else {
                // Fallback para canciones que no están en la BD
                const newSong = {
                    id: Date.now(), // ID temporal único
                    ruta: ruta,
                    titulo: titulo,
                    artista: artista,
                    portada: portada || '../assets/portadas/default-album.jpg'
                };
                currentPlaylist = [newSong];
                currentTrackIndex = 0;
                loadTrack(currentTrackIndex);
                playTrack();
            }
        };

        // Función para obtener canciones relacionadas (del mismo artista o álbum)
        function obtenerCancionesRelacionadas(cancionId) {
            const cancionActual = allSongs.find(song => song.id == cancionId);
            if (!cancionActual) return;

            // Filtrar canciones del mismo artista o álbum
            const relacionadas = allSongs.filter(song => 
                song.id !== cancionId && (
                    song.artista === cancionActual.artista || 
                    song.album === cancionActual.album
                )
            );

            // Crear playlist con la canción actual + relacionadas + resto
            const otrasRandom = allSongs.filter(song => 
                song.id !== cancionId && 
                song.artista !== cancionActual.artista && 
                song.album !== cancionActual.album
            ).sort(() => Math.random() - 0.5);

            currentPlaylist = [
                cancionActual,
                ...relacionadas.sort(() => Math.random() - 0.5),
                ...otrasRandom
            ];

            currentTrackIndex = 0;
            loadTrack(currentTrackIndex);
            playTrack();
        }

        // Inicializar al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            initializePlayer();
            cargarCancionesDesdeDB();
        });