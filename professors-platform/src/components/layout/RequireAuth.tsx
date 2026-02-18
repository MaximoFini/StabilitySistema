import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useEffect, useState } from "react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const professor = useAuthStore((state) => state.professor);
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give some time for the auth store to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show nothing while checking initial auth state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAuthenticated || !professor) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
