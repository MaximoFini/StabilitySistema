import { registerSW } from "virtual:pwa-register";

// ── Registro del Service Worker ───────────────────────────────────────────
// Con registerType: "autoUpdate" en vite.config.ts, el SW se actualiza
// automáticamente. skipWaiting + clientsClaim garantizan activación inmediata.

const updateSW = registerSW({
  immediate: true,

  onNeedRefresh() {
    // Nueva versión del SW disponible → recargar para aplicar
    updateSW(true);
  },

  onOfflineReady() {
    // App lista para funcionar sin conexión
  },

  onRegisteredSW(_swUrl, registration) {
    // Chequear actualizaciones periódicamente (cada 60s)
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    }
  },

  onRegisterError(_error) {
    // Si falla el registro del SW, limpiar caches para recuperar 
    if ("caches" in window) {
      caches
        .keys()
        .then((names) => Promise.all(names.map((n) => caches.delete(n))));
    }
  },
});
