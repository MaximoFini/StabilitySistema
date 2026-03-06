import { useEffect, useState } from "react";
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
  const hasHydrated = useAuthStore((state) => state.hasHydrated); // <-- Suscribirse aquí
  const location = useLocation();

  if (!hasHydrated) {
    return <AuthLoadingScreen />;
  }

  if (isInitializing) {
    return <AuthLoadingScreen />;
  }
  if (!isAuthenticated && !professor) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
