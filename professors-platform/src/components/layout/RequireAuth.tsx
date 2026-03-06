import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

// Timeout máximo para evitar pantalla de carga infinita (5 segundos)
const AUTH_TIMEOUT_MS = 5000;

function AuthLoadingScreen() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full"
      style={{
        background: "linear-gradient(135deg, #0b1d3a 0%, #0d2654 50%, #0b1d3a 100%)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: "20px",
          padding: "20px 24px",
          width: 140,
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
        }}
      >
        <img
          src="/logo-stability.png"
          alt="Stability"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Wordmark */}
      <p
        style={{
          marginTop: 24,
          fontFamily:
            "'Palatino Linotype','Palatino','Book Antiqua',Georgia,serif",
          fontSize: "2rem",
          fontWeight: 400,
          letterSpacing: "0.22em",
          color: "#ffffff",
          textShadow: "0 2px 20px rgba(0,0,0,0.4)",
        }}
      >
        STABILITY
      </p>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.35)" }} />
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.45)" }} />
        <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.35)" }} />
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "'Gill Sans','Gill Sans MT',Calibri,'Trebuchet MS',sans-serif",
          fontSize: "0.62rem",
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          marginTop: 8,
        }}
      >
        Entrenamiento y Salud
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: 120,
          height: 2,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 99,
          marginTop: 40,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "40%",
            background: "rgba(255,255,255,0.7)",
            borderRadius: 99,
            animation: "splashBar 1.4s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes splashBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(340%); }
        }
      `}</style>
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
