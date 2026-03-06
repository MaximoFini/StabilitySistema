import { registerSW } from "virtual:pwa-register";

console.log("[PWA] Iniciando registro del Service Worker...");

// Función para limpiar todos los caches (usado en caso de problemas)
async function clearAllCaches() {
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      console.log("[PWA] Limpiando caches:", cacheNames);
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log("[PWA] Todos los caches eliminados");
    } catch (error) {
      console.error("[PWA] Error al limpiar caches:", error);
    }
  }
}

// Limpiar caches problemáticos al inicio (una sola vez)
const CACHE_CLEARED_KEY = "pwa-caches-cleared-v2";
if (!localStorage.getItem(CACHE_CLEARED_KEY)) {
  clearAllCaches().then(() => {
    localStorage.setItem(CACHE_CLEARED_KEY, Date.now().toString());
    console.log("[PWA] Caches limpiados por primera vez en esta versión");
  });
}

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info("[PWA] Nueva versión disponible - recargando...");
    // Dar tiempo para que el SW se active antes de recargar
    setTimeout(() => {
      window.location.reload();
    }, 100);
  },
  onOfflineReady() {
    console.info("[PWA] ✅ App lista para funcionar offline.");
  },
  onRegistered(registration) {
    console.log("[PWA] ✅ Service Worker registrado exitosamente");
    if (registration) {
      // Chequear actualizaciones cada 60 segundos
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

console.log("[PWA] registerSW ejecutado, updateSW:", typeof updateSW);

// Exportar función de limpieza para uso manual si es necesario
export { clearAllCaches };
