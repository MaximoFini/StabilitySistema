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
