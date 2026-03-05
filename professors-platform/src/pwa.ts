import { registerSW } from "virtual:pwa-register";

console.log("[PWA] Iniciando registro del Service Worker...");

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.info("[PWA] Nueva versión disponible - recargando...");
    window.location.reload();
  },
  onOfflineReady() {
    console.info("[PWA] ✅ App lista para funcionar offline.");
  },
  onRegistered(registration) {
    console.log("[PWA] ✅ Service Worker registrado exitosamente");
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 1000); // Chequear cada minuto
    }
  },
  onRegisterError(error) {
    console.error("[PWA] ❌ Error al registrar SW:", error);
  },
});

console.log("[PWA] registerSW ejecutado, updateSW:", typeof updateSW);
