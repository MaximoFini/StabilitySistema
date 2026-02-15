import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuthStore } from "@/features/auth/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState<'student' | 'coach'>('student')
    const navigate = useNavigate()
    const { login, isLoading } = useAuthStore()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: false,
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password, data.rememberMe)
            toast.success('¡Bienvenido de nuevo!')
            navigate("/inicio", { replace: true })
        } catch {
            toast.error('Credenciales inválidas')
        }
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto flex flex-col gap-6">
                {/* Logo */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-full flex items-center justify-center py-4">
                        <div className="bg-brand-blue rounded-xl p-6 w-48 h-auto flex flex-col items-center justify-center shadow-lg">
                            <div className="relative mb-2">
                                <h1 className="text-white text-3xl font-sans tracking-tight font-light flex items-start">
                                    <span className="font-normal tracking-tight scale-y-125 inline-block origin-bottom">STABILITY</span>
                                    <span className="absolute -top-1 -right-3 text-white/80 text-xs">
                                        <span className="material-symbols-outlined text-[16px] animate-spin-slow">settings</span>
                                    </span>
                                </h1>
                            </div>
                            <div className="w-full h-px bg-white/50 mb-2"></div>
                            <p className="text-white/90 text-[10px] font-light tracking-wide uppercase">Entrenamiento y salud</p>
                        </div>
                    </div>
                    <h2 className="text-text-main dark:text-white text-[28px] font-bold leading-tight text-center">Bienvenido de nuevo</h2>
                    <p className="text-text-secondary text-sm text-center -mt-2">Gestiona tu entrenamiento profesional</p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 md:p-8 w-full flex flex-col gap-6">
                    {/* Role Toggle */}
                    <div className="flex w-full">
                        <div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                            <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 transition-all duration-200 ${role === 'student' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-text-secondary dark:text-slate-400'} text-sm font-semibold leading-normal`}>
                                <span className="truncate">Soy Alumno</span>
                                <input
                                    type="radio"
                                    name="role_selector"
                                    value="student"
                                    checked={role === 'student'}
                                    onChange={() => setRole('student')}
                                    className="invisible w-0 absolute"
                                />
                            </label>
                            <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 transition-all duration-200 ${role === 'coach' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-text-secondary dark:text-slate-400'} text-sm font-semibold leading-normal`}>
                                <span className="truncate">Soy Coach</span>
                                <input
                                    type="radio"
                                    name="role_selector"
                                    value="coach"
                                    checked={role === 'coach'}
                                    onChange={() => setRole('coach')}
                                    className="invisible w-0 absolute"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                icon={<span className="material-symbols-outlined">mail</span>}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="•••••••••"
                                icon={<span className="material-symbols-outlined">lock</span>}
                                endIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-text-secondary hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                }
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <Checkbox
                                id="rememberMe"
                                label="Recordarme"
                                {...register("rememberMe")}
                            />
                            <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                    <span>Iniciando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Iniciar Sesión</span>
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border-color dark:border-slate-600"></div>
                            </div>
                            <div className="relative bg-white dark:bg-[#1e293b] px-4">
                                <span className="text-xs text-text-secondary dark:text-slate-400">o continúa con</span>
                            </div>
                        </div>

                        {/* Google OAuth Placeholder */}
                        <div className="relative group">
                            <Button
                                type="button"
                                variant="outline"
                                disabled
                                className="w-full opacity-50 cursor-not-allowed border-2 border-dashed"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Continuar con Google</span>
                            </Button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                Próximamente
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                    <div className="border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <p className="text-text-secondary dark:text-slate-400 text-sm">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="font-bold text-primary hover:text-primary-hover ml-1 transition-colors">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>

                <div className="h-4"></div>
            </div>
        </div>
    )
}
