import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";

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
