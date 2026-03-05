import { registerSW } from "virtual:pwa-register";

// Registra el Service Worker automáticamente.
// Con registerType: 'autoUpdate', el SW se actualiza en segundo plano
// sin necesidad de confirmación del usuario.
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Opcional: aquí podrías mostrar un toast/banner
    // invitando al usuario a recargar para obtener la nueva versión.
    console.info("[PWA] Nueva versión disponible.");
    window.location.reload();
  },
  onOfflineReady() {
    console.info("[PWA] App lista para funcionar offline.");
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 30 * 1000); // Chequear cada 30 segundos
    }
  },
  onRegisterError(error) {
    console.error("[PWA] Error registrando SW:", error);
  },
});
