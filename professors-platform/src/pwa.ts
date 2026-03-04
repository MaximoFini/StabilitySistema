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
  },
  onOfflineReady() {
    console.info("[PWA] App lista para funcionar offline.");
  },
});
