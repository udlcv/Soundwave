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
    
    function asegurarEspacioReproductor() {
        // Seleccionar todas las tablas de canciones
        const tablas = document.querySelectorAll('table.canciones-table');
        
        // Verificar si el reproductor está activo
        const reproductorVisible = document.getElementById('reproductor-container').style.display !== 'none';
        
        // Si no hay tablas o el reproductor no está visible, no hacer nada
        if (!tablas.length || !reproductorVisible) return;
        
        tablas.forEach(tabla => {
          const tbody = tabla.querySelector('tbody');
          if (!tbody) return;
          
          // Eliminar espaciadores existentes
          const espaciadoresExistentes = tbody.querySelectorAll('[id^="reproductor-espaciador"]');
          espaciadoresExistentes.forEach(e => e.remove());
          
          // Crear y añadir un nuevo espaciador
          const espaciador = document.createElement('tr');
          espaciador.id = 'reproductor-espaciador';
          espaciador.innerHTML = '<td colspan="6" style="height: 0.1px;"></td>';
          tbody.appendChild(espaciador);
        });
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
            
            recargarFavoritos();
        });
    }

    // Función para recargar solo la sección de favoritos
    function recargarFavoritos() {
        console.log("Recargando tabla de favoritos...");
        
        // Obtener la tabla de favoritos
        const tablaFavoritos = document.getElementById('tabla-favoritos') || 
                              document.querySelector('.favoritos-container table');
        
        if (!tablaFavoritos) {
            console.warn("No se encontró la tabla de favoritos");
            return;
        }
        
        const tbodyFavoritos = tablaFavoritos.querySelector('tbody');
        
        // Mostrar indicador de carga
        if (tbodyFavoritos) {
            tbodyFavoritos.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
        }
        
        // Realizar la petición AJAX
        fetch('../php/cargar_canciones_favoritas.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar favoritos: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
            if (tbodyFavoritos) {
                tbodyFavoritos.innerHTML = html;
                console.log("Favoritos recargados con éxito");
                
                // Reactivar los eventos en los nuevos botones
                activarBotonesEnFavoritos();
                
                // IMPORTANTE: Forzar la aplicación del espacio después de un breve retraso
                setTimeout(function() {
                    aplicarEspacioReproductor();
                }, 200); // Aumentamos el tiempo para asegurarnos que todo se haya cargado
            }
        })
        .catch(error => {
                console.error("Error al recargar favoritos:", error);
                if (tbodyFavoritos) {
                    tbodyFavoritos.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar favoritos</td></tr>';
                }
            });
    }

    // Función para activar los eventos en los botones recién cargados
    function activarBotonesEnFavoritos() {
    const tablaFavoritos = document.getElementById('tabla-favoritos') || 
                          document.querySelector('.favoritos-container table');
    
    if (!tablaFavoritos) return;
    
    // Activar botones de reproducción
    const botonesReproducir = tablaFavoritos.querySelectorAll('.btn-reproducir');
    botonesReproducir.forEach(btn => {
        btn.addEventListener('click', function() {
            const ruta = this.dataset.ruta;
            const titulo = this.dataset.titulo;
            const artista = this.dataset.artista;
            const portada = this.dataset.portada;
            
            reproducirCancion(ruta, titulo, artista, portada);
        });
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
document.addEventListener('DOMContentLoaded', function() {
    // Observar cambios en el reproductor
    const reproductor = document.getElementById('reproductor-container');
    if (reproductor) {
        // Verificar inicialmente
        if (reproductor.style.display !== 'none') {
            setTimeout(aplicarEspacioReproductor, 200);
        }
        
        // Configurar un MutationObserver para detectar cambios en el estilo de display
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    // Si el display cambia a 'block', aplicar el espacio
                    if (reproductor.style.display !== 'none') {
                        setTimeout(aplicarEspacioReproductor, 200);
                    }
                }
            });
        });
        
        // Observar cambios en el atributo style
        observer.observe(reproductor, { attributes: true, attributeFilter: ['style'] });
    }
});


// Función para inicializar los controles de volumen
function inicializarControlVolumen() {
  const volumeSlider = document.getElementById('volume-slider');
  const volumeLevel = document.getElementById('volume-level');
  const volumeHandle = document.getElementById('volume-handle');
  const volumeIcon = document.getElementById('volume-icon');
  const audioContainer = document.getElementById('reproductor-audio-container');
  
  if (!volumeSlider || !volumeLevel || !volumeHandle || !volumeIcon || !audioContainer) {
    console.warn('No se encontraron todos los elementos necesarios para el control de volumen');
    return;
  }
  
  // Variable para almacenar el nivel de volumen actual (0-1)
  let currentVolume = 0.7; // 70% por defecto
  
  // Función para actualizar la interfaz de volumen
  function actualizarInterfazVolumen() {
    const porcentaje = currentVolume * 100;
    volumeLevel.style.width = `${porcentaje}%`;
    volumeHandle.style.left = `${porcentaje}%`;
    
    // Actualizar el icono según el nivel de volumen
    if (currentVolume === 0) {
      volumeIcon.className = 'fas fa-volume-mute';
    } else if (currentVolume < 0.4) {
      volumeIcon.className = 'fas fa-volume-down';
    } else {
      volumeIcon.className = 'fas fa-volume-up';
    }
    
    // Aplicar el volumen al elemento de audio si existe
    const audioElement = audioContainer.querySelector('audio');
    if (audioElement) {
      audioElement.volume = currentVolume;
    }
  }
  
  // Inicializar la interfaz
  actualizarInterfazVolumen();
  
  // Controlar el volumen haciendo clic en el slider
  volumeSlider.addEventListener('click', function(event) {
    const rect = volumeSlider.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const sliderWidth = rect.width;
    
    // Calcular el nuevo volumen (entre 0 y 1)
    currentVolume = Math.max(0, Math.min(1, clickX / sliderWidth));
    
    // Actualizar la interfaz
    actualizarInterfazVolumen();
  });
  
  // Alternar mute al hacer clic en el icono
  volumeIcon.addEventListener('click', function() {
    if (currentVolume > 0) {
      // Guardar el volumen actual y establecer a 0 (mute)
      volumeIcon.dataset.lastVolume = currentVolume;
      currentVolume = 0;
    } else {
      // Restaurar el volumen anterior o establecer en 0.7 si no hay uno guardado
      currentVolume = parseFloat(volumeIcon.dataset.lastVolume || 0.7);
    }
    
    // Actualizar la interfaz
    actualizarInterfazVolumen();
  });
}

// Inicializar el control de volumen cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(inicializarControlVolumen, 500);
  
  // Observar cambios en la visibilidad del reproductor
  const reproductorContainer = document.getElementById('reproductor-container');
  if (reproductorContainer) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'style' && 
            reproductorContainer.style.display !== 'none') {
          inicializarControlVolumen();
        }
      });
    });
    
    observer.observe(reproductorContainer, { attributes: true });
  }
});