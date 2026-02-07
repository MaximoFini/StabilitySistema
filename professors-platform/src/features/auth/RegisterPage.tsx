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
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

// Step 1: Personal Data Validation
const personalDataSchema = z.object({
    firstName: z.string().min(2, 'Mínimo 2 caracteres'),
    lastName: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Debe incluir mayúscula')
        .regex(/[a-z]/, 'Debe incluir minúscula')
        .regex(/[0-9]/, 'Debe incluir número'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

// Step 2: Terms Validation
const termsSchema = z.object({
    acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
    acceptPrivacy: z.boolean().refine(val => val === true, 'Debes aceptar la política'),
})

type PersonalDataForm = z.infer<typeof personalDataSchema>
type TermsForm = z.infer<typeof termsSchema>

function getPasswordStrength(password: string): { level: 'weak' | 'medium' | 'strong'; percentage: number } {
    if (!password || password.length < 8) {
        return { level: 'weak', percentage: 33 }
    }

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)

    const score = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length

    if (score >= 4 && password.length >= 8) {
        return { level: 'strong', percentage: 100 }
    } else if (score >= 2 && password.length >= 8) {
        return { level: 'medium', percentage: 66 }
    }
    return { level: 'weak', percentage: 33 }
}

export default function RegisterPage() {
    const [step, setStep] = useState(1)
    const [role, setRole] = useState<'student' | 'coach'>('coach')
    const [personalData, setPersonalData] = useState<PersonalDataForm | null>(null)
    const navigate = useNavigate()
    const { register: registerUser, isLoading } = useAuthStore()

    // Step 1 Form
    const step1Form = useForm<PersonalDataForm>({
        resolver: zodResolver(personalDataSchema),
    })

    // Step 2 Form
    const step2Form = useForm<TermsForm>({
        resolver: zodResolver(termsSchema),
        defaultValues: {
            acceptTerms: false,
            acceptPrivacy: false,
        },
    })

    const password = step1Form.watch("password") || ""
    const passwordStrength = getPasswordStrength(password)

    const handleStep1Submit = (data: PersonalDataForm) => {
        setPersonalData(data)
        setStep(2)
    }

    const handleStep2Submit = async (data: TermsForm) => {
        if (!personalData) return

        try {
            await registerUser({
                ...personalData,
                role,
                acceptTerms: data.acceptTerms,
                acceptPrivacy: data.acceptPrivacy,
            })
            toast.success('¡Cuenta creada exitosamente!')
            navigate("/", { replace: true })
        } catch {
            toast.error('Error al crear la cuenta')
        }
    }

    const strengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500',
    }

    const strengthLabels = {
        weak: 'Débil',
        medium: 'Media',
        strong: 'Fuerte',
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen relative flex flex-col items-center justify-center overflow-x-hidden py-10">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#F0F4F8] to-[#E2E8F0] dark:from-[#0f1923] dark:to-[#1a2c3d] z-0"></div>
            <div className="fixed inset-0 geo-pattern z-0 pointer-events-none"></div>

            <main className="relative z-10 w-full max-w-[480px] p-4 flex flex-col gap-6">
                {/* Header */}
                <header className="flex flex-col items-center justify-center text-center space-y-2 py-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-white text-[24px]">fitness_center</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-main dark:text-white">STABILITY</h1>
                    </div>
                    <p className="text-text-secondary dark:text-slate-400 font-medium text-sm sm:text-base">
                        Plataforma de Gestión para Entrenadores
                    </p>
                </header>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                    <span className={step >= 1 ? 'text-primary font-semibold' : ''}>Datos</span>
                    <span>→</span>
                    <span className={step >= 2 ? 'text-primary font-semibold' : ''}>Términos</span>
                </div>
                <Progress value={step === 1 ? 50 : 100} className="h-1" />

                {/* Form Card */}
                <div className="bg-white dark:bg-[#1a2632] rounded-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700/50 p-6 sm:p-8 w-full">
                    {step === 1 && (
                        <>
                            <div className="mb-6 text-center sm:text-left">
                                <h2 className="text-xl sm:text-2xl font-bold text-text-main dark:text-white leading-tight">
                                    Crear Cuenta Profesional
                                </h2>
                                <p className="text-sm text-text-secondary dark:text-slate-400 mt-1">
                                    Únete a la comunidad de alto rendimiento
                                </p>
                            </div>

                            {/* Role Toggle */}
                            <div className="flex w-full mb-6">
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

                            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="flex flex-col gap-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Nombre</Label>
                                        <Input placeholder="Juan" {...step1Form.register("firstName")} />
                                        {step1Form.formState.errors.firstName && (
                                            <p className="text-xs text-destructive">{step1Form.formState.errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Apellido</Label>
                                        <Input placeholder="Pérez" {...step1Form.register("lastName")} />
                                        {step1Form.formState.errors.lastName && (
                                            <p className="text-xs text-destructive">{step1Form.formState.errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="juan@ejemplo.com"
                                        icon={<span className="material-symbols-outlined">mail</span>}
                                        {...step1Form.register("email")}
                                    />
                                    {step1Form.formState.errors.email && (
                                        <p className="text-xs text-destructive">{step1Form.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Contraseña</Label>
                                    <Input
                                        type="password"
                                        placeholder="Mínimo 8 caracteres"
                                        icon={<span className="material-symbols-outlined">lock</span>}
                                        {...step1Form.register("password")}
                                    />
                                    {password && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${strengthColors[passwordStrength.level]}`}
                                                    style={{ width: `${passwordStrength.percentage}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-medium ${passwordStrength.level === 'weak' ? 'text-red-500' :
                                                    passwordStrength.level === 'medium' ? 'text-yellow-600' : 'text-green-500'
                                                }`}>
                                                {strengthLabels[passwordStrength.level]}
                                            </span>
                                        </div>
                                    )}
                                    {step1Form.formState.errors.password && (
                                        <p className="text-xs text-destructive">{step1Form.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Confirmar Contraseña</Label>
                                    <Input
                                        type="password"
                                        placeholder="Repite tu contraseña"
                                        icon={<span className="material-symbols-outlined">lock</span>}
                                        {...step1Form.register("confirmPassword")}
                                    />
                                    {step1Form.formState.errors.confirmPassword && (
                                        <p className="text-xs text-destructive">{step1Form.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="mt-2 w-full">
                                    Siguiente
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </Button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="mb-6 text-center sm:text-left">
                                <h2 className="text-xl sm:text-2xl font-bold text-text-main dark:text-white leading-tight">
                                    Términos y Condiciones
                                </h2>
                                <p className="text-sm text-text-secondary dark:text-slate-400 mt-1">
                                    Por favor, acepta los términos para continuar
                                </p>
                            </div>

                            <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="flex flex-col gap-5">
                                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="acceptTerms"
                                            {...step2Form.register("acceptTerms")}
                                            className="mt-1 h-4 w-4 rounded border-border-color text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="acceptTerms" className="text-sm text-text-main dark:text-slate-200 cursor-pointer">
                                            Acepto los <a href="#" className="text-primary hover:underline">Términos y Condiciones</a> del servicio
                                        </label>
                                    </div>
                                    {step2Form.formState.errors.acceptTerms && (
                                        <p className="text-xs text-destructive ml-7">{step2Form.formState.errors.acceptTerms.message}</p>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="acceptPrivacy"
                                            {...step2Form.register("acceptPrivacy")}
                                            className="mt-1 h-4 w-4 rounded border-border-color text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="acceptPrivacy" className="text-sm text-text-main dark:text-slate-200 cursor-pointer">
                                            Acepto la <a href="#" className="text-primary hover:underline">Política de Privacidad</a>
                                        </label>
                                    </div>
                                    {step2Form.formState.errors.acceptPrivacy && (
                                        <p className="text-xs text-destructive ml-7">{step2Form.formState.errors.acceptPrivacy.message}</p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                        Anterior
                                    </Button>
                                    <Button type="submit" disabled={isLoading} className="flex-1">
                                        {isLoading ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                                <span>Creando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Crear Cuenta</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-center">
                        <p className="text-sm text-text-secondary dark:text-slate-400">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="font-bold text-primary hover:text-primary-hover transition-colors ml-1">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 pb-4">
                    <div className="flex items-center gap-1 text-xs text-text-secondary font-semibold">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                        <span>Datos Seguros</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-secondary font-semibold">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        <span>Verificado</span>
                    </div>
                </div>
            </main>
        </div>
    )
}
