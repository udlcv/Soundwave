/* Script para cambiar entre páginas */
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a los enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Referencias a los contenidos de cada página
    const homeContent = document.getElementById('home-content');
    const playlistsContent = document.getElementById('playlists-content');
    const favoritesContent = document.getElementById('favorites-content');
    
    // Mapa de páginas para facilitar el acceso
    const pages = {
      'home': homeContent,
      'playlists': playlistsContent,
      'favorites': favoritesContent
    };
    
    // Función para cambiar de página
    function changePage(pageId) {
      // Verificar si la página existe
      if (!pages[pageId]) {
        pageId = 'home'; // Redirigir a home si la página no existe
        history.replaceState(null, null, '#' + pageId);
      }
      
      // Ocultar todas las páginas
      for (let key in pages) {
        pages[key].classList.remove('active');
      }
      
      // Mostrar la página seleccionada
      pages[pageId].classList.add('active');
      
      // Hacer scroll a la sección seleccionada
      pages[pageId].scrollIntoView({ behavior: 'smooth', block: 'start' });
      // O simplemente volver al inicio de la página
      // window.scrollTo(0, 0);
      
      // Actualizar clase activa en navegación
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
          link.classList.add('active');
        }
      });
    }
    
    // Asignar eventos a los enlaces de navegación
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageId = this.getAttribute('data-page');
        if (pageId) {
          changePage(pageId);
          // Actualizar la URL sin recargar la página
          history.pushState(null, null, '#' + pageId);
        }
      });
    });
    
    // Manejar eventos de navegación del historial
    window.addEventListener('popstate', function() {
      const pageId = window.location.hash.substring(1) || 'home';
      changePage(pageId);
    });
    
    // Verificar si hay un hash en la URL al cargar la página
    if (window.location.hash) {
      const pageId = window.location.hash.substring(1);
      changePage(pageId);
    } else {
      // Mostrar página por defecto si no hay hash
      changePage('home');
    }
  });