import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { router } from "@/router";
import { useAuthStore } from "@/features/auth/store/authStore";

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();

    // Prefetch the most-visited route chunks while the user sees the splash/login.
    // Uses a delay so prefetch never competes with the initial React + Supabase bundles.
    // Fire-and-forget: errors are intentionally swallowed.
    const prefetchTimer = setTimeout(() => {
      import("@/features/auth/Login").catch(() => { });
      import("@/features/students/StudentsList").catch(() => { });
      import("@/features/training/TrainingHome").catch(() => { });
    }, 1500);

    return () => clearTimeout(prefetchTimer);
  }, [initializeAuth]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
