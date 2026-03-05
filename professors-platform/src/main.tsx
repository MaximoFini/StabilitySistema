import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./pwa";
import "./index.css";
import App from "./App.tsx";

// Limpiar Service Workers y caches viejos (TEMPORAL)
if ("serviceWorker" in navigator) {
  // Desregistrar todos los SW
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log("[PWA] Service Worker desregistrado");
      });
    }
  });

  // Limpiar todos los caches
  caches.keys().then((names) => {
    for (const name of names) {
      caches.delete(name);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
