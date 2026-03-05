import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

// Timeout máximo para evitar pantalla de carga infinita (5 segundos)
const AUTH_TIMEOUT_MS = 5000;

function AuthLoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">
        progress_activity
      </span>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const professor = useAuthStore((state) => state.professor);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const location = useLocation();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Timeout de seguridad: si isInitializing tarda más de AUTH_TIMEOUT_MS,
  // asumimos que algo falló y redirigimos a login
  useEffect(() => {
    if (!isInitializing) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      if (isInitializing) {
        console.warn(
          "[RequireAuth] Auth initialization timed out after",
          AUTH_TIMEOUT_MS,
          "ms",
        );
        setHasTimedOut(true);
      }
    }, AUTH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isInitializing]);

  // Si ocurre timeout, redirigir a login para evitar pantalla blanca
  if (hasTimedOut && isInitializing) {
    console.warn("[RequireAuth] Redirecting to login due to timeout");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Esperar mientras se inicializa la autenticación
  if (isInitializing) {
    return <AuthLoadingScreen />;
  }

  // Zustand con persist hidrata el estado sincrónicamente desde localStorage
  // antes del primer render, por lo que no necesitamos esperar ningún delay.
  if (!isAuthenticated && !professor) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
