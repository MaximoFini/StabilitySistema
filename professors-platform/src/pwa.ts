import { registerSW } from "virtual:pwa-register";

console.log("[PWA] Iniciando registro del Service Worker...");

// ── Limpiar Service Workers anteriores ────────────────────────────────────
// Esto previene conflictos con versiones anteriores del SW
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      console.log(
        "[PWA] Limpiando",
        registrations.length,
        "SW(s) anterior(es)...",
      );
      Promise.all(registrations.map((reg) => reg.unregister())).then(() => {
        console.log("[PWA] ✅ Service Workers anteriores eliminados");
        // Después de limpiar, registrar el nuevo
        iniciarRegistro();
      });
    } else {
      // No hay SWs anteriores, registrar inmediatamente
      iniciarRegistro();
    }
  });
}

function iniciarRegistro() {
  // ── Registro del Service Worker ───────────────────────────────────────────
  // Con registerType: "autoUpdate" en vite.config.ts, el SW se actualiza
  // automáticamente. skipWaiting + clientsClaim garantizan activación inmediata.

  const updateSW = registerSW({
    immediate: true,

    onNeedRefresh() {
      console.log(
        "[PWA] Nueva versión disponible - aplicando actualización...",
      );
      // Nueva versión del SW disponible → recargar para aplicar
      updateSW(true);
    },

    onOfflineReady() {
      console.log("[PWA] ✅ App lista para funcionar offline");
    },

    onRegisteredSW(swUrl, registration) {
      console.log("[PWA] ✅ Service Worker registrado:", swUrl);
      // Chequear actualizaciones periódicamente (cada 60s)
      if (registration) {
        setInterval(() => {
          console.log("[PWA] Chequeando actualizaciones del SW...");
          registration.update();
        }, 60 * 1000);
      }
    },

    onRegisterError(error) {
      console.error("[PWA] ❌ Error al registrar Service Worker:", error);
      // Si falla el registro del SW, limpiar caches para recuperar
      if ("caches" in window) {
        console.log("[PWA] Limpiando caches debido a error...");
        caches
          .keys()
          .then((names) => Promise.all(names.map((n) => caches.delete(n))));
      }
    },
  });

  console.log("[PWA] Módulo PWA cargado exitosamente");
}
