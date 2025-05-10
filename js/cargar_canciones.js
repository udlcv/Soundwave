function cargarCanciones() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("canciones-list").innerHTML = this.responseText;
            
            // Add spacer after loading songs
            var spacer = document.createElement('div');
            spacer.className = 'reproductor-spacer';
            spacer.style.height = '100px';
            spacer.style.width = '100%';
            document.getElementById("canciones-list").appendChild(spacer);
            
            // Ya no es necesario configurar botones aquí
        }
    };
    xhttp.open("GET", "../php/cargar_canciones.php", true);
    xhttp.send();
  }
  
  // Esta función puede simplificarse o eliminarse por completo
  // ya que ahora usamos delegación de eventos
  function configurarBotones() {
    console.log("Botones configurados (mediante delegación de eventos)");
  }