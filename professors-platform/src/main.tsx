import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Montar React PRIMERO, luego registrar el SW de forma no-bloqueante
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Importar PWA de forma asíncrona para que nunca bloquee el render
import("./pwa").catch(() => {
  // Si falla la carga del módulo PWA, la app sigue funcionando
});
