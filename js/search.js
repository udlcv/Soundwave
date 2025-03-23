document.addEventListener('DOMContentLoaded', function() {
    // Referencia al campo de búsqueda usando la clase correcta
    const searchInput = document.querySelector('.search-bar');
    
    // Referencia a la tabla de canciones
    const cancionesTable = document.getElementById('canciones-table') || document.querySelector('table');
    
    // Guarda el contenido original de la tabla
    let contenidoOriginal = '';
    
    // Almacenar el contenido original de la tabla cuando la página cargue
    if (cancionesTable) {
        const tbody = cancionesTable.querySelector('tbody');
        if (tbody) {
            contenidoOriginal = tbody.innerHTML;
        }
    }
    
    // Función para realizar la búsqueda con un pequeño delay
    let timeoutId;
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            
            // Esperar 500ms después de que el usuario deje de escribir para hacer la búsqueda
            timeoutId = setTimeout(function() {
                const busqueda = searchInput.value.trim();
                
                // Si el campo está vacío, restaurar el contenido original
                if (busqueda === '') {
                    // En lugar de solo restaurar del caché, hacer una nueva solicitud para cargar todas las canciones
                    cargarTodasLasCanciones();
                    return;
                }
                
                realizarBusqueda(busqueda);
            }, 500);
        });
        
        // También podemos agregar la búsqueda cuando el usuario presiona Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevenir que se envíe un formulario si está dentro de uno
                
                const busqueda = searchInput.value.trim();
                if (busqueda !== '') {
                    // Forzar la búsqueda inmediatamente
                    clearTimeout(timeoutId);
                    realizarBusqueda(busqueda);
                } else {
                    // Si el campo está vacío y presiona Enter, cargar todas las canciones
                    cargarTodasLasCanciones();
                }
            }
        });
    }
    
    // NUEVA FUNCIÓN: Asegurar que haya espacio debajo de la última canción
    function asegurarEspacioReproductor() {
        // Verificar si ya existe el espaciador
        let espaciador = document.getElementById('reproductor-espaciador');
        
        // Si no existe, crearlo
        if (!espaciador) {
            espaciador = document.createElement('tr');
            espaciador.id = 'reproductor-espaciador';
            espaciador.innerHTML = '<td colspan="6" style="height: 150px;"></td>';
            
            // Añadirlo al final de la tabla
            const tbody = cancionesTable.querySelector('tbody');
            if (tbody) {
                tbody.appendChild(espaciador);
            }
        }
        
        // Asegurarnos de que sea visible cuando el reproductor está activo
        const reproductorContainer = document.getElementById('reproductor-container');
        if (reproductorContainer) {
            espaciador.style.display = reproductorContainer.style.display !== 'none' ? 'table-row' : 'none';
        }
    }
    
    // Función para cargar todas las canciones (usando respuesta JSON)
    function cargarTodasLasCanciones() {
        console.log("Cargando todas las canciones...");
        
        // Opción 1: Usar el endpoint JSON para mayor consistencia
        fetch('../php/cargar_canciones.php?format=json')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const tbody = cancionesTable.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = data.canciones.map(cancion => cancion.html).join('');
                        contenidoOriginal = tbody.innerHTML;
                        console.log("Canciones cargadas con éxito (formato JSON)");
                        
                        // Añadir el espaciador después de cargar las canciones
                        asegurarEspacioReproductor();
                    }
                } else {
                    console.error("Error al cargar canciones:", data.message);
                    const tbody = cancionesTable.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = `<tr><td colspan="6">${data.message}</td></tr>`;
                    }
                }
            })
            .catch(error => {
                console.error('Error al cargar canciones en formato JSON:', error);
                
                // Si falla, intentamos con el formato HTML original
                cargarTodasCancionesHTML();
            });
    }
    
    // Función de respaldo para cargar canciones en formato HTML (compatible con versiones anteriores)
    function cargarTodasCancionesHTML() {
        console.log("Intentando cargar canciones en formato HTML...");
        fetch('../php/cargar_canciones.php')
            .then(response => response.text())
            .then(html => {
                const tbody = cancionesTable.querySelector('tbody');
                if (tbody) {
                    tbody.innerHTML = html;
                    contenidoOriginal = html;
                    console.log("Canciones cargadas con éxito (formato HTML)");
                    
                    // Añadir el espaciador después de cargar las canciones
                    asegurarEspacioReproductor();
                }
            })
            .catch(error => {
                console.error('Error al cargar todas las canciones:', error);
                const tbody = cancionesTable.querySelector('tbody');
                if (tbody && contenidoOriginal) {
                    tbody.innerHTML = contenidoOriginal;
                    asegurarEspacioReproductor();
                }
            });
    }
    
    // Función para realizar la búsqueda
    function realizarBusqueda(busqueda) {
        console.log("Realizando búsqueda para:", busqueda);
        fetch(`../php/buscar_canciones.php?q=${encodeURIComponent(busqueda)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Actualizar la tabla con los resultados
                    const tbody = cancionesTable.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = data.canciones.map(cancion => cancion.html).join('');
                        console.log("Resultados de búsqueda cargados");
                        
                        // Añadir el espaciador después de cargar los resultados
                        asegurarEspacioReproductor();
                    }
                } else {
                    // Mostrar mensaje de que no se encontraron resultados
                    const tbody = cancionesTable.querySelector('tbody');
                    if (tbody) {
                        tbody.innerHTML = `<tr><td colspan="6">${data.message}</td></tr>`;
                    }
                }
            })
            .catch(error => {
                console.error('Error al buscar canciones:', error);
            });
    }
    
    // Delegación de eventos para botones de reproducción
    document.addEventListener('click', function(event) {
        // Verificar si el clic fue en un botón de reproducción
        if (event.target.closest('.play-btn')) {
            const boton = event.target.closest('.play-btn');
            const ruta = boton.getAttribute('data-ruta');
            const titulo = boton.getAttribute('data-titulo');
            const artista = boton.getAttribute('data-artista');
            const portada = boton.getAttribute('data-portada');
            
            console.log("Reproduciendo:", titulo, "por", artista);
            console.log("Ruta de la portada:", portada);
            
            // Llamar a la función de reproducir canción
            reproducirCancion(ruta, titulo, artista, portada);
            
            // Asegurar que el espaciador sea visible
            asegurarEspacioReproductor();
        }
    });
    
    // Delegación de eventos para los botones me gusta
    document.addEventListener('click', function(event) {
        // Verificar si el clic fue en un botón de me gusta
        if (event.target.closest('.me-gusta-btn')) {
            const btn = event.target.closest('.me-gusta-btn');
            procesarMeGusta(btn);
        }
    });
    
    // Función para procesar el clic en el botón me gusta
    function procesarMeGusta(btn) {
        console.log("Procesando clic en botón Me gusta");
        const cancionId = btn.dataset.id;
        
        if (!cancionId) {
            console.error("Error: No se encontró el ID de la canción");
            alert("Error: No se pudo identificar la canción");
            return;
        }
        
        // Determinar la acción basada en el estado actual
        const isActive = btn.classList.contains('activo');
        const url = isActive ? '../php/quitar_favorito.php' : '../php/agregar_favorito.php';
        
        console.log('Enviando solicitud a:', url);
        console.log('ID de canción:', cancionId);
        console.log('Estado actual:', isActive ? 'Activo (Quitar de favoritos)' : 'Inactivo (Agregar a favoritos)');
        
        // Deshabilitar el botón durante la solicitud
        btn.disabled = true;
        btn.style.opacity = "0.5"; // Feedback visual
        
        // Hacer solicitud AJAX
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `cancion_id=${cancionId}`,
            credentials: 'same-origin' // Importante para enviar cookies de sesión
        })
        .then(response => {
            console.log('Respuesta del servidor:', response.status, response.statusText);
            if (response.status === 404) {
                throw new Error('No se encontró el archivo PHP: ' + url);
            }
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos recibidos:', data);
            if (data.success) {
                // Actualizar la UI solo si la operación fue exitosa
                btn.classList.toggle('activo');
                btn.innerHTML = btn.classList.contains('activo') 
                    ? '❤️ Me gusta' 
                    : '♡ Me gusta';
                
                console.log('Operación exitosa:', data.message);
            } else {
                console.error('Error reportado por el servidor:', data.message);
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error.message);
            alert('Ha ocurrido un error: ' + error.message);
        })
        .finally(() => {
            // Reactivar el botón
            btn.disabled = false;
            btn.style.opacity = "1";
        });
    }
    
    // Modificación de la función reproducirCancion global
    if (typeof window.reproducirCancion !== 'function') {
        window.reproducirCancion = function(ruta, titulo, artista, portada) {
            console.log("Función de reproducción global: ", titulo, artista);
            
            // Mostrar el reproductor
            const reproductorContainer = document.getElementById('reproductor-container');
            if (reproductorContainer) {
                reproductorContainer.style.display = 'block';
                
                // Actualizar la información de texto
                const tituloElement = document.getElementById('reproductor-titulo');
                const artistaElement = document.getElementById('reproductor-artista');
                const portadaElement = document.getElementById('reproductor-portada');
                const backgroundElement = document.getElementById('reproductor-background');
                const audioContainer = document.getElementById('reproductor-audio-container');
                
                if (tituloElement) tituloElement.textContent = titulo;
                if (artistaElement) artistaElement.textContent = artista;
                
                // Establecer la portada predeterminada si no hay portada
                const portadaUrl = portada || '../assets/portadas/default-album.jpg';
                
                // Actualizar directamente la portada
                if (portadaElement) portadaElement.src = portadaUrl;
                
                // Actualizar el fondo con blur
                if (backgroundElement) backgroundElement.style.backgroundImage = 'url("' + portadaUrl + '")';
                
                // Crear o actualizar el elemento de audio
                if (audioContainer) {
                    audioContainer.innerHTML = ''; // Limpiar contenedor
                    
                    const audioElement = document.createElement('audio');
                    audioElement.controls = true;
                    audioElement.autoplay = true;
                    audioElement.src = ruta;
                    
                    audioContainer.appendChild(audioElement);
                }
                
                // Asegurar que el espaciador sea visible cuando el reproductor está activo
                asegurarEspacioReproductor();
            } else {
                console.error("Error: No se encontró el contenedor del reproductor");
            }
        };
    } else {
        // Intercepción de la función reproducirCancion existente
        const originalReproducirCancion = window.reproducirCancion;
        window.reproducirCancion = function(ruta, titulo, artista, portada) {
            // Llamar a la función original
            originalReproducirCancion(ruta, titulo, artista, portada);
            
            // Asegurar que el espaciador sea visible
            asegurarEspacioReproductor();
        };
    }
    
    // Verificar el estado del reproductor cuando se carga la página
    setTimeout(function() {
        const reproductorContainer = document.getElementById('reproductor-container');
        if (reproductorContainer && reproductorContainer.style.display !== 'none') {
            asegurarEspacioReproductor();
        }
    }, 500);
    
    // Cargar las canciones al iniciar la página
    if (cancionesTable) {
        console.log("Inicializando la página...");
        cargarTodasLasCanciones();
    } else {
        console.warn("No se encontró la tabla de canciones");
    }
});