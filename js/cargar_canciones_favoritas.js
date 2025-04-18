// Función para cargar canciones favoritas mediante AJAX
// Function to load favorite songs via AJAX
function cargarCancionesFavoritas() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          document.getElementById("lista-canciones-favoritas").innerHTML = this.responseText;
          
          // Add two spacers after loading songs
          var spacer1 = document.createElement('div');
          spacer1.className = 'reproductor-spacer-1';
          spacer1.style.height = '50px';
          spacer1.style.width = '100%';
          document.getElementById("lista-canciones-favoritas").appendChild(spacer1);
          
          var spacer2 = document.createElement('div');
          spacer2.className = 'reproductor-spacer-2';
          spacer2.style.height = '50px';
          spacer2.style.width = '100%';
          document.getElementById("lista-canciones-favoritas").appendChild(spacer2);
          
          configurarBotonesReproducir();
      }
  };
  xhttp.open("GET", "../php/cargar_canciones_favoritas.php", true);
  xhttp.send();
}

// Configure play buttons for favorite songs
function configurarBotonesReproducir() {
  var botonesReproducir = document.querySelectorAll('.btn-reproducir');
  botonesReproducir.forEach(function(boton) {
      boton.addEventListener('click', function() {
          var ruta = this.getAttribute('data-ruta');
          var titulo = this.getAttribute('data-titulo');
          var artista = this.getAttribute('data-artista');
          var portada = this.getAttribute('data-portada');
          
          reproducirCancion(ruta, titulo, artista, portada);
      });
  });
}

// Function to play song and display the player
function reproducirCancion(ruta, titulo, artista, portada) {
  // Set default cover if none provided
  var portadaUrl = portada || '../assets/portadas/default-album.jpg';
  
  // Show player in all sections by moving it outside the section containers
  document.getElementById('reproductor-container').style.display = 'block';
  
  // Update text information
  document.getElementById('reproductor-titulo').textContent = titulo;
  document.getElementById('reproductor-artista').textContent = artista;
  
  // Update cover image
  document.getElementById('reproductor-portada').src = portadaUrl;
  
  // Update background with blur effect
  document.getElementById('reproductor-background').style.backgroundImage = `url(${portadaUrl})`;
  
  // Create or update audio element
  var audioContainer = document.getElementById('reproductor-audio-container');
  audioContainer.innerHTML = ''; // Clear container
  
  var audioElement = document.createElement('audio');
  audioElement.controls = true;
  audioElement.autoplay = true;
  audioElement.src = ruta;
  audioElement.className = 'reproductor-audio';
  
  audioContainer.appendChild(audioElement);
  
  // Store the current song info in localStorage to persist across sections
  localStorage.setItem('currentSong', JSON.stringify({
    ruta: ruta,
    titulo: titulo,
    artista: artista,
    portada: portadaUrl
  }));
}

// Function to restore player state when switching sections
function restaurarReproductor() {
  var songData = localStorage.getItem('currentSong');
  if (songData) {
    var song = JSON.parse(songData);
    // Just update the player UI without autoplay
    document.getElementById('reproductor-container').style.display = 'block';
    document.getElementById('reproductor-titulo').textContent = song.titulo;
    document.getElementById('reproductor-artista').textContent = song.artista;
    document.getElementById('reproductor-portada').src = song.portada;
    document.getElementById('reproductor-background').style.backgroundImage = `url(${song.portada})`;
    
    // Check if we need to recreate the audio element (only if not already playing)
    var audioContainer = document.getElementById('reproductor-audio-container');
    if (audioContainer.querySelector('audio') === null) {
      var audioElement = document.createElement('audio');
      audioElement.controls = true;
      audioElement.src = song.ruta;
      audioElement.className = 'reproductor-audio';
      audioContainer.appendChild(audioElement);
    }
  }
}

// Load favorite songs when the page loads
document.addEventListener('DOMContentLoaded', function() {
  cargarCancionesFavoritas();
  
  // Restore player state if there was a song playing
  restaurarReproductor();
  
  // Handle section navigation - add this to your existing navigation code
  var navLinks = document.querySelectorAll('.nav-link'); // Adjust selector based on your navigation
  navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      // Your existing section switching code here
      
      // Additionally, restore the player when switching sections
      setTimeout(restaurarReproductor, 100); // Short timeout to ensure DOM is updated
    });
  });
});

function asegurarEspacioReproductor() {
  // Verificar si ya existen los espaciadores
  let espaciador1 = document.getElementById('reproductor-espaciador-1');
  let espaciador2 = document.getElementById('reproductor-espaciador-2');
  
  const tbody = cancionesTable.querySelector('tbody');
  
  // Si no existe el primer espaciador, crearlo
  if (!espaciador1) {
      espaciador1 = document.createElement('tr');
      espaciador1.id = 'reproductor-espaciador-1';
      espaciador1.innerHTML = '<td colspan="6" style="height: 75px;"></td>';
      
      // Añadirlo al final de la tabla
      if (tbody) {
          tbody.appendChild(espaciador1);
      }
  }
  
  // Si no existe el segundo espaciador, crearlo
  if (!espaciador2) {
      espaciador2 = document.createElement('tr');
      espaciador2.id = 'reproductor-espaciador-2';
      espaciador2.innerHTML = '<td colspan="6" style="height: 100px;"></td>';
      
      // Añadirlo al final de la tabla
      if (tbody) {
          tbody.appendChild(espaciador2);
      }
  }
  
  // Asegurarnos de que sean visibles cuando el reproductor está activo
  const reproductorContainer = document.getElementById('reproductor-container');
  if (reproductorContainer) {
      const displayStyle = reproductorContainer.style.display !== 'none' ? 'table-row' : 'none';
      espaciador1.style.display = displayStyle;
      espaciador2.style.display = displayStyle;
  }
}