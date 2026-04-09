// ─── APP.JS — Inicialización de la app ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {

  // Registrar Service Worker para PWA / offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Service Worker no registrado:', err);
    });
  }

  // Precargar datos base en segundo plano
  cargarDatosBase().catch(err => console.warn('Error cargando datos base:', err));

  // Comprobar partida guardada
  if (hayPartidaGuardada()) {
    document.getElementById('btn-continuar').style.display = 'flex';
    document.getElementById('btn-exportar').style.display  = 'flex';
  }

  // Prevenir zoom en doble tap (iOS)
  let lastTap = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) e.preventDefault();
    lastTap = now;
  }, { passive: false });

  // Prevenir scroll por defecto en el cuerpo (mantener fullscreen)
  document.addEventListener('touchmove', (e) => {
    if (!e.target.closest('.pantalla') && !e.target.closest('.drawer')) {
      e.preventDefault();
    }
  }, { passive: false });

  // Cerrar todos los overlays al iniciar (por si quedó alguno abierto en la sesión anterior)
  document.querySelectorAll('.overlay').forEach(el => el.classList.remove('activo'));

  console.log('Blackmoor Hall — app iniciada');
});

// ── Puente global para habilidades de personaje llamadas desde state.js ──────
function _activarVisionMedium(jugIdx) {
  if (typeof UI !== 'undefined' && typeof UI._activarVisionMedium_impl === 'function') {
    // Pequeño delay para que la notificación de -TEM se muestre primero
    setTimeout(() => UI._activarVisionMedium_impl(jugIdx), 400);
  }
}
