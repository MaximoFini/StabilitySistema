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
            navigate("/", { replace: true })
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
