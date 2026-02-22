import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, data.rememberMe);
      toast.success("¡Bienvenido de nuevo!");

      const currentProfessor = useAuthStore.getState().professor;

      if (currentProfessor?.role === "coach") {
        navigate("/inicio", { replace: true });
      } else if (currentProfessor?.role === "student") {
        if (!currentProfessor.hasCompletedProfile) {
          navigate("/register/complete-profile", { replace: true });
        } else {
          navigate("/entrenamiento", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      // El error específico se muestra en el cuadro de error y en authStore
      const errorMessage =
        error instanceof Error ? error.message : "Error al iniciar sesión";

      // Mostrar toast solo si es un error importante
      if (errorMessage.includes("demasiadas veces")) {
        toast.error(errorMessage);
      }

      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300">
      {/* Left Panel - Only visible on large screens */}
      <div className="hidden lg:flex w-1/2 relative bg-primary items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Gym weights background"
            className="w-full h-full object-cover opacity-40 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCInrZDpmQgQD_lEDYX12gML5JldSHxVLiCV9gYhWlVWdJUOq1CDCJoxVJptMj5MR8Btgnc3T1MPzNq2VLQfpQXZlwQ6-LgsfF40KxiGezmniir2kvBFPg7o2N7_3GEhT0TN0qf8ZZBCcsEfZzb57DQew68Yuqi4yAX2x4Rcphemkm4irvU-k2J7_aB7Be-4NvD-XOyW8H8PDB-9k_UwTKcjFMNoNTAqXA78heOVzQqrY3fOqZdfLW9XL53tafKbdRhl9x4tmpnFps"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-primary/40"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-white">
          <div className="relative">
            <h1 className="font-serif text-7xl tracking-widest font-bold relative z-10">
              STABILIT
              <span className="relative inline-block">
                Y
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl text-white/90">
                  <span
                    className="material-symbols-outlined animate-spin"
                    style={{ animationDuration: "3s" }}
                  >
                    settings
                  </span>
                </span>
              </span>
            </h1>
          </div>
          <div className="w-full h-px bg-white/50 my-4 max-w-[80%]"></div>
          <p className="text-sm uppercase tracking-[0.3em] font-light">
            Entrenamiento y salud
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto relative">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <span className="font-bold text-xl tracking-wide">STABILITY</span>
              <span className="material-symbols-outlined text-sm">
                settings
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenido de nuevo
            </h2>
            <p className="text-muted-light dark:text-muted-dark text-sm">
              Gestiona tu entrenamiento profesional
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-xl dark:shadow-none dark:border dark:border-border-dark p-6 sm:p-8">
            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Error Alert */}
              {authError && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex gap-3">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400 flex-shrink-0">
                    error
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      {authError}
                    </p>
                    {authError.toLowerCase().includes("no está registrado") && (
                      <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                        Si es la primera vez, puedes{" "}
                        <Link
                          to="/register"
                          className="font-semibold hover:underline"
                        >
                          crear una cuenta aquí
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Correo Electrónico
                </Label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-lg">
                      mail
                    </span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    {...register("email")}
                    className="block w-full pl-10 pr-3 py-2.5 border border-border-light dark:border-border-dark rounded-md bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Contraseña
                  </Label>
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-lg">
                      lock
                    </span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="block w-full pl-10 pr-10 py-2.5 border border-border-light dark:border-border-dark rounded-md bg-input-light dark:bg-input-dark text-text-light dark:text-text-dark placeholder-gray-400 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  />
                  <div
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-gray-400 text-lg hover:text-gray-600 dark:hover:text-gray-200">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    {...register("rememberMe")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-gray-600 dark:text-gray-400"
                  >
                    Recordarme
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        progress_activity
                      </span>
                      <span>Iniciando...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <span className="material-symbols-outlined ml-2 text-sm">
                        arrow_forward
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative mt-8 mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card-light dark:bg-card-dark text-muted-light dark:text-muted-dark">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Google OAuth Placeholder */}
            <div>
              <button
                type="button"
                disabled
                className="w-full flex justify-center items-center px-4 py-2.5 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </button>
            </div>
          </div>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?
            <Link
              to="/register"
              className="font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400 ml-1"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
