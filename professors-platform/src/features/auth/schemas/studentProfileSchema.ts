import { z } from "zod";

// =====================================================
// STEP 3: Datos Personales Adicionales
// =====================================================

export const step3Schema = z.object({
  phone: z
    .string()
    .min(10, "Número de teléfono debe tener al menos 10 dígitos")
    .max(20, "Número de teléfono demasiado largo")
    .regex(
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
      "Formato de teléfono inválido",
    ),
  instagram: z
    .string()
    .regex(
      /^@?[a-zA-Z0-9._]+$/,
      "Formato de Instagram inválido (solo letras, números, . y _)",
    )
    .optional()
    .or(z.literal("")),
  profileImage: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "La imagen debe ser menor a 5MB",
    )
    .refine(
      (file) =>
        ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
          file.type,
        ),
      "Solo se permiten archivos PNG, JPG o WEBP",
    )
    .optional(),
});

export type Step3FormData = z.infer<typeof step3Schema>;

// =====================================================
// STEP 4: Datos Antropométricos
// =====================================================

export const step4Schema = z.object({
  birthDate: z
    .string()
    .min(1, "Fecha de nacimiento es requerida")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      const adjustedAge =
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;

      return adjustedAge >= 12 && adjustedAge <= 100;
    }, "Debes tener entre 12 y 100 años"),
  gender: z.enum(["male", "female", "other"] as const, {
    error: "Selecciona un sexo",
  }),
  height: z
    .number({
      message: "Altura debe ser un número",
    })
    .min(100, "Altura mínima: 100cm")
    .max(250, "Altura máxima: 250cm"),
  weight: z
    .number({
      message: "Peso debe ser un número",
    })
    .min(30, "Peso mínimo: 30kg")
    .max(300, "Peso máxima: 300kg"),
});

export type Step4FormData = z.infer<typeof step4Schema>;

// =====================================================
// STEP 5: Datos Físicos y Objetivos
// =====================================================

export const step5Schema = z.object({
  activityLevel: z.enum(
    ["sedentary", "light", "moderate", "active", "very_active"] as const,
    {
      error: "Selecciona un nivel de actividad",
    },
  ),
  primaryGoal: z.enum(
    ["aesthetic", "sports", "health", "rehabilitation"] as const,
    {
      error: "Selecciona un objetivo",
    },
  ),
  trainingExperience: z.enum(
    ["none", "beginner", "intermediate", "advanced"] as const,
    {
      error: "Selecciona tu nivel de experiencia",
    },
  ),
  sports: z
    .string()
    .min(2, "Ingresa al menos un deporte")
    .max(200, "Máximo 200 caracteres"),
  previousInjuries: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
  medicalConditions: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type Step5FormData = z.infer<typeof step5Schema>;

// =====================================================
// SCHEMA COMPLETO (todos los steps combinados)
// =====================================================

export const completeStudentProfileSchema = step3Schema
  .merge(step4Schema)
  .merge(step5Schema);

export type CompleteStudentProfileData = z.infer<
  typeof completeStudentProfileSchema
>;

// =====================================================
// HELPER: Calcular IMC
// =====================================================

export const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height || height === 0) return 0;
  return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
};

// =====================================================
// HELPER: Clasificación de IMC
// =====================================================

export const getBMIClassification = (
  bmi: number,
): {
  label: string;
  color: string;
  icon: string;
} => {
  if (bmi < 18.5) {
    return {
      label: "Bajo peso",
      color: "text-yellow-600 dark:text-yellow-500",
      icon: "⚠️",
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      label: "Peso normal",
      color: "text-green-600 dark:text-green-500",
      icon: "✅",
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      label: "Sobrepeso",
      color: "text-orange-600 dark:text-orange-500",
      icon: "⚠️",
    };
  } else {
    return {
      label: "Obesidad",
      color: "text-red-600 dark:text-red-500",
      icon: "🔴",
    };
  }
};
