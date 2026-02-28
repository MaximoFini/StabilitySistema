# 📋 Reporte QA — Stability Sistema

> **Rol:** Ingeniero de QA  
> **Fecha:** 2026-02-27  
> **Metodología:** Revisión estática de código (sin ejecución). Cada test se evalúa leyendo archivos fuente, hooks, rutas, stores y lógica de DB.

---

## Leyenda

| Símbolo     | Significado                                                        |
| ----------- | ------------------------------------------------------------------ |
| ✅ PASA     | El código implementa correctamente el comportamiento esperado      |
| ❌ FALLA    | Se detectó un bug o comportamiento incorrecto en el código         |
| ⚠️ ATENCIÓN | No es un bug crítico pero requiere decisión o revisión manual      |
| 🔵 N/A      | No se puede verificar solo con código (requiere ejecución o infra) |

---

## 1. 🔐 SEGURIDAD

### 1.1 Autenticación & Sesiones

#### 1.1.1 — Variables de entorno expuestas

**Estado: ⚠️ ATENCIÓN**

Las claves `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se usan correctamente (son claves públicas por diseño). Sin embargo, el `testing.md` pregunta por Firebase. El archivo `src/lib/firebase.ts` existe pero está **completamente vacío (0 bytes)**. Esto indica que Firebase fue removido del código pero el archivo vacío quedó como residuo.

**Conclusión:** Las variables VITE\_ de Firebase apuntadas en el `testing.md` (sección 5.1) no tienen código que las consuma, pero si están en el `.env` configuradas, son un vector de exposición innecesario.

**Acción:** Eliminar las variables `VITE_FIREBASE_*` del `.env` y del hosting, y borrar `src/lib/firebase.ts`.

---

#### 1.1.2 — Doble sistema de auth (Firebase + Supabase)

**Estado: ✅ PASA (parcialmente)**

`src/lib/firebase.ts` está vacío. No hay imports de Firebase en ningún componente activo. El sistema solo usa Supabase Auth. Sin embargo, la dependencia `firebase` podría seguir instalada en `package.json`.

**Riesgo residual:** El archivo vacío y posibles dependencias en `node_modules` aumentan el bundle. Verificar con `npm ls firebase`.

---

#### 1.1.3 — Token de sesión y expiración

**Estado: ⚠️ ATENCIÓN**

`authStore.ts` línea 71 define `TOKEN_EXPIRY_TIME = 60 * 60 * 1000` (60 min). Sin embargo, **nunca se verifica activamente** si el token expiró. La lógica de `updateActivity` (línea 274) solo actualiza el timestamp; no hay ningún check en ningún middleware o guard que lea `tokenExpiry` y rechace peticiones. Supabase auto-renueva el token (porque `autoRefreshToken: true` en línea 13 de `supabase.ts`), pero el campo `tokenExpiry` local en Zustand es puramente informativo y nunca se actúa sobre él.

**Impacto:** Un usuario con sesión cacheada en localStorage podría tener `isAuthenticated: true` aunque el token real de Supabase caducó. En la práctica, Supabase lo maneja, pero la lógica custom de `tokenExpiry` en Zustand es código muerto.

---

#### 1.1.4 — Auto-logout por inactividad deshabilitado

**Estado: ⚠️ ATENCIÓN**

Confirmado: `authStore.ts` línea 68-69 tiene el comentario explícito:

```
// Inactivity timeout (disabled - session persists until manual logout)
```

Y en `updateActivity()` línea 279-283 el timer siempre se limpia sin crear uno nuevo. Para producción con datos de salud sensibles, esto es un riesgo aceptable solo si el equipo lo decidió conscientemente.

**Decisión requerida:** ¿Los coaches dejan sus sesiones abiertas en dispositivos compartidos?

---

#### 1.1.5 — Persistencia de sesión en localStorage

**Estado: ✅ PASA**

`authStore.ts` líneas 651-656, la función `partialize` del middleware `persist` solo guarda:

```ts
{
  (professor, isAuthenticated, lastActivity, tokenExpiry);
}
```

No se persiste la contraseña, tokens de Supabase, ni secrets. Los tokens JWT los maneja el SDK de Supabase en su propio storage interno, separado del store de Zustand.

---

### 1.2 Autorización (RLS & Roles)

#### 1.2.1 — RLS en todas las tablas

**Estado: ❌ FALLA (3 tablas críticas)**

Ya documentado en `plan-seguridad-rls.md`. Las tablas con RLS habilitado pero sin ninguna política son:

- `workout_completions` — rompe el registro de entrenamientos del alumno
- `exercise_weight_logs` — rompe el guardado de pesos
- `exercise_rm_notes` — bloquea notas de RM del coach

**Solución:** Ejecutar los SQLs del `plan-seguridad-rls.md` (pasos 4, 5 y 6).

---

#### 1.2.2 — RequireRole en rutas de coach

**Estado: ✅ PASA**

Verificado en `src/router/index.tsx`. **Todas** las rutas de coach están envueltas en `<RequireRole role="coach">`:

- `/inicio` → StudentsList ✅
- `/dashboard` → BusinessMetrics ✅
- `/biblioteca` → Library ✅
- `/planificador` → NewPlan ✅
- `/alumno/:studentId` → StudentProfile ✅

Y `RequireRole.tsx` verifica correctamente `professor.role !== role` (línea 16), redirigiendo a `/` si el rol no coincide. Un alumno que intente acceder a `/inicio` será correctamente redirigido.

---

#### 1.2.3 — Coach solo ve SUS alumnos

**Estado: ❌ FALLA**

`useStudents.ts` líneas 75-79 hace:

```ts
supabase
  .from("profiles")
  .select("id, first_name, last_name")
  .eq("role", "student")
  .order("created_at", { ascending: false });
```

**No filtra por `coach_id`**. Trae TODOS los alumnos del sistema. Cualquier coach puede ver los alumnos de otro coach. La única protección es RLS a nivel de base de datos (que ya está configurada para mostrar solo alumnos con asignaciones del coach actual).

**El problema real:** La RLS policy en `profiles` (creada en el plan de seguridad) limita la lectura a alumnos propios. Pero si el coach A puede ver alumnos del coach B depende de si la RLS nueva fue aplicada. Con las políticas del `plan-seguridad-rls.md` aplicadas, esto se resuelve a nivel DB.

**Verificar:** Si `useBusinessMetrics.ts` también trae todos los alumnos sin filtrar (línea 118-132). **SÍ**: la query no filtra por coach_id, trae todos los alumnos del sistema. Esto puede ser intencional (un único coach por ahora) o un bug si el sistema va a tener múltiples coaches.

---

### 1.3 Protección de Datos

#### 1.3.1 — Sanitización de inputs con Zod

**Estado: ✅ PASA**

- `Login.tsx` usa `loginSchema` con Zod ✅
- `RegisterPage.tsx` usa `personalDataSchema` y `termsSchema` con Zod ✅
- `StudentProfileSetup.tsx` usa `step3Schema`, `step4Schema`, `step5Schema` con Zod ✅
- `useTrainingPlans.ts` no hace inputs directos del usuario a queries raw; pasa datos ya validados ✅

No se detectaron inputs sin validación que lleguen a Supabase.

---

#### 1.3.2 — Subida de archivos (Storage)

**Estado: ⚠️ ATENCIÓN (validación solo en frontend)**

`StudentProfileSetup.tsx` líneas 49-62 valida correctamente:

- Tamaño: `file.size > 5 * 1024 * 1024` → rechaza > 5MB ✅
- Tipos: `["image/png", "image/jpeg", "image/jpg", "image/webp"]` ✅

Sin embargo, `supabase-storage.ts` línea 37-42 hace el upload **sin restricciones backend**. Si alguien llama la función directamente (ej: desde DevTools), puede subir cualquier tipo de archivo.

**Solución:** Configurar políticas en el bucket `profile-images` de Supabase Storage (panel → Storage → Policies) para:

1. Limitar tamaño máximo (max file size en MB)
2. Restringir MIME types permitidos en la política

---

#### 1.3.3 — Datos médicos sensibles

**Estado: 🔵 N/A (decisión de negocio)**

Los datos `previous_injuries`, `medical_conditions`, `weight_kg`, `height_cm` se almacenan en plain text en Supabase. No hay encriptación adicional a nivel de aplicación. Supabase cifra los datos en reposo (AES-256), pero no hay field-level encryption. La decisión de si esto cumple con regulaciones Argentina/GDPR es de negocio, no técnica.

---

### 1.4 Secrets & Configuración

#### 1.4.1 — .env no está en el repo

**Estado: ❌ FALLA (no hay .gitignore)**

La búsqueda de `.gitignore` en la raíz del proyecto devolvió **0 resultados**. Hay proyectos Vite que generan `.gitignore` automáticamente, pero en este caso no se encontró. Si no existe, el `.env` con las claves de Supabase podría commitearse accidentalmente.

**Solución:** Crear un `.gitignore` en la raíz del proyecto:

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment variables — NUNCA commitear
.env
.env.*
!.env.example

# Logs
*.log

# Editor
.vscode/
.idea/
```

---

#### 1.4.2 — Firebase config restringida por dominio

**Estado: ✅ PASA (de hecho Firebase no se usa)**

`firebase.ts` está vacío. No hay ningún uso activo de Firebase. Esta prueba no aplica.

---

---

## 2. ⚡ RENDIMIENTO

### 2.1 Problemas Conocidos

#### 2.1.1 — Login lento (userToProfessor con queries secuenciales)

**Estado: ✅ PASA (ya corregido)**

`authStore.ts` líneas 78-91: `userToProfessor` ya usa `Promise.all`:

```ts
const [{ data: profile, error }, { data: studentProfile }] = await Promise.all([
  profilePromise,
  studentProfilePromise,
]);
```

Las dos queries se ejecutan en paralelo. ✅

---

#### 2.1.2 — Logout lento

**Estado: ✅ PASA (ya corregido)**

`authStore.ts` líneas 477-492: El logout limpia el estado local **inmediatamente** (línea 478-484) y luego llama a Supabase en background con `.catch()` (fire-and-forget, línea 487). El usuario ve el logout al instante. ✅

---

#### 2.1.3 — useStudents waterfall (3 queries secuenciales)

**Estado: ✅ PASA (ya corregido)**

`useStudents.ts` líneas 92-117: Las queries 2 y 3 (`student_profiles` y `training_plan_assignments`) usan `Promise.all`. La única secuencialidad necesaria es que la query 1 (perfiles) devuelva los IDs antes. ✅

---

#### 2.1.4 — setTimeout hardcodeado que bloquea el register

**Estado: ❌ FALLA**

`StudentProfileSetup.tsx` líneas 110-112:

```ts
setTimeout(() => {
  navigate("/entrenamiento", { replace: true });
}, 1500);
```

Hay un **delay artificial de 1.5 segundos** antes de redirigir al alumno tras completar el perfil. No fue eliminado. Es UX innecesariamente lenta.

**Solución en `StudentProfileSetup.tsx` línea 110-112:**

```ts
// Reemplazar:
setTimeout(() => {
  navigate("/entrenamiento", { replace: true });
}, 1500);

// Por:
navigate("/entrenamiento", { replace: true });
```

---

#### 2.1.5 — initializeAuth redundante (re-fetch con datos ya hidratados)

**Estado: ✅ PASA (ya optimizado)**

`authStore.ts` líneas 208-217: Ya hay una guarda explícita:

```ts
if (currentState.professor && currentState.isAuthenticated) {
  // Solo actualizar timestamps, no hacer fetch
  set({ lastActivity: now, tokenExpiry: now + TOKEN_EXPIRY_TIME });
} else {
  // Sin datos → hacer fetch normal
  const professor = await userToProfessor(session.user);
  ...
}
```

Si Zustand ya tiene datos hidratados desde localStorage, no hace la llamada a DB. ✅

---

### 2.2 Bundle & Carga

#### 2.2.1 — Code Splitting con lazy()

**Estado: ✅ PASA**

`router/index.tsx` usa `lazy()` para todas las páginas: Login, RegisterPage, StudentRegister, StudentProfileSetup, StudentsList, BusinessMetrics, Library, NewPlan, StudentProfile, TrainingLayout, TrainingHome, MoodCheckScreen, ExerciseList, ExerciseDetail, WorkoutComplete, TrainingProgress, TrainingProfile. ✅

---

### 2.3 Queries a Base de Datos

#### 2.3.1 — N+1 queries en useStudents

**Estado: ⚠️ ATENCIÓN (mejorable pero funcional)**

`useStudents.ts` hace 3 queries total (1 para profiles, 1 para student_profiles, 1 para assignments) en lugar de N+1. Es eficiente para el tamaño actual. Si el coach tiene 100+ alumnos, considerar una función RPC en Supabase.

---

#### 2.3.2 — Bug crítico en getAssignedStudents: columna inexistente

**Estado: ❌ FALLA (bug de runtime)**

`useTrainingPlans.ts` línea 699:

```ts
.select("id, full_name, email, avatar_url")
```

La tabla `profiles` **no tiene** columnas `full_name` ni `avatar_url`. Tiene `first_name`, `last_name`, y `profile_image`. Esta query fallará silenciosamente (Supabase devuelve `null` para columnas que no existen), resultando en que **todos los alumnos asignados se muestran como "Sin nombre"**.

**Verificación:** Línea 726 maneja el fallback `profile?.full_name || "Sin nombre"`, confirmando que el dato nunca llega.

**Solución en `useTrainingPlans.ts` línea 699:**

```ts
// Reemplazar:
.select("id, full_name, email, avatar_url")

// Por:
.select("id, first_name, last_name, email, profile_image")
```

Y en línea 726:

```ts
// Reemplazar:
fullName: profile?.full_name || "Sin nombre",
avatarUrl: profile?.avatar_url || null,

// Por:
fullName: profile ? `${profile.first_name} ${profile.last_name}` : "Sin nombre",
avatarUrl: profile?.profile_image || null,
```

---

---

## 3. 🧠 LÓGICA DE NEGOCIO

### 3.1 Flujo de Entrenamiento (Alumno)

#### 3.1.1 — Asignación activa con múltiples activas

**Estado: ✅ PASA**

`useActiveAssignment.ts` líneas 59-72: La query filtra por `status = 'active'`, ordena por `assigned_at DESC` y hace `.limit(1).single()`. Si hay 2 asignaciones activas, toma la más reciente. ✅

---

#### 3.1.2 — Evitar completar el mismo día dos veces

**Estado: ✅ PASA**

`useActiveAssignment.ts` líneas 130-138: Construye un Set de `completedDayNumbers` y busca el primer día sin completar:

```ts
let dayData = sortedDays.find(
  (day) => !completedDayNumbers.has(day.day_number),
);
```

El día completado no aparecerá como "siguiente día". Sin embargo, **no bloquea explícitamente el INSERT** de un completion duplicado a nivel de código. Si un alumno llega directamente a la URL `/entrenamiento/dia/:dayId` de un día ya completado, técnicamente puede completarlo de nuevo.

**Riesgo:** Sin un constraint UNIQUE en BD (`assignment_id`, `day_number`) en `workout_completions`, es posible crear completions duplicadas. Esta es una **decisión de BD** no code.

---

#### 3.1.3 — Workout completion: progreso en memoria (trainingStore)

**Estado: ⚠️ ATENCIÓN**

Si el alumno cierra la app durante un workout, el progreso de sets completados (guardado en `trainingStore` en memoria) se pierde. Solo se persiste cuando se llama a `saveCompletion`. Este es el diseño actual y es un trade-off conocido.

---

#### 3.1.4 — Mood check: ¿es obligatorio o se puede saltar?

**Estado: ❌ FALLA (se puede saltar)**

`MoodCheckScreen.tsx` no tiene protección. La ruta `/entrenamiento/mood/:dayId` solo está dentro de `<RequireAuth>` (router línea 120), no dentro de `<RequireRole role="student">`.

Más importante: la ruta `/entrenamiento/dia/:dayId` (ExerciseList) **también** solo requiere `<RequireAuth>` (línea 125). Un alumno puede navegar directamente a `/entrenamiento/dia/ID` sin pasar por el mood check. El `trainingStore` puede querer `initialMood` seteado, pero no lo verifica al iniciar.

**Impacto:** Datos de `initial_mood` serán `null` para alumnos que salten la pantalla de mood.

---

#### 3.1.5 — Estado "completed" cuando finished_days >= total_days

**Estado: ✅ PASA**

`useWorkoutCompletions.ts` líneas 167-182:

```ts
const newStatus = newCompletedDays >= totalDays ? "completed" : "active";
```

El assignment pasa a `completed` automáticamente, y `useActiveAssignment` no devuelve asignaciones con `status !== 'active'` (línea 69). ✅

---

#### 3.1.6 — RPE y mood mapping

**Estado: ⚠️ ATENCIÓN**

`useWorkoutCompletions.ts` líneas 110-116: El mapa es:

```ts
{ excelente: "excellent", normal: "normal", fatigado: "tired", molestia: "pain" }
```

Los valores de la UI en `MoodCheckScreen` son `happy`, `neutral`, `sad` (para `initialMood`), que son diferentes al mapa de `mood` al finalizar. El `finalMood` viene de otro componente (WorkoutComplete). Verificar que los valores del finalMood coincidan con las claves del mapa. Si el componente envía `"excelente"` en español, el mapa funciona; si envía otro valor, `moodValue` será `null`.

---

### 3.2 Flujo de Coach

#### 3.2.1 — Asignar plan a alumno con asignación activa duplicada

**Estado: ❌ FALLA (no hay validación)**

`useTrainingPlans.ts` líneas 613-650: `assignPlanToStudents` hace un INSERT directo sin verificar si el alumno ya tiene una asignación activa del mismo plan. Un coach podría asignar el mismo plan dos veces al mismo alumno.

**Solución en `useTrainingPlans.ts`:**

```ts
const assignPlanToStudents = async (planId, studentIds, startDate, endDate) => {
  // Verificar asignaciones existentes activas
  const { data: existingAssignments } = await supabase
    .from("training_plan_assignments")
    .select("student_id")
    .eq("plan_id", planId)
    .in("student_id", studentIds)
    .eq("status", "active");

  const alreadyAssigned = new Set(
    existingAssignments?.map((a) => a.student_id) ?? [],
  );
  const filteredStudentIds = studentIds.filter(
    (id) => !alreadyAssigned.has(id),
  );

  if (filteredStudentIds.length === 0) {
    return {
      success: false,
      error: "Todos los alumnos seleccionados ya tienen este plan asignado.",
    };
  }
  // ... continuar con filteredStudentIds
};
```

---

#### 3.2.2 — Eliminar plan (ON DELETE CASCADE)

**Estado: ✅ PASA**

`deletePlan` hace soft-delete (`is_archived: true`), no un DELETE real. Esto preserva integridad referencial. Los assignments e histórico no se borran. ✅

---

### 3.3 Registro & Perfiles

#### 3.3.1 — hasCompletedProfile + redirección

**Estado: ✅ PASA**

`Login.tsx` línea 47-49:

```ts
if (!currentProfessor.hasCompletedProfile) {
  navigate("/register/complete-profile", { replace: true });
}
```

Y la ruta `/register/complete-profile` está protegida con `<RequireAuth>` (router línea 151). Un alumno sin perfil completo no puede acceder a `/entrenamiento` directamente porque `RequireRole` no está en esa ruta, pero sí `RequireAuth`. Verificar si un alumno autenticado puede acceder a `/entrenamiento` sin completar perfil navegando directo a la URL.

**Riesgo:** La ruta `/entrenamiento` tiene `<RequireAuth>` + `<RequireRole role="student">` (router línea 103-108), pero **no verifica `hasCompletedProfile`**. Un alumno con `isAuthenticated=true` y `hasCompletedProfile=false` que navegue directamente a `/entrenamiento` **accederá sin completar el perfil**.

**Solución:** Agregar un guard `hasCompletedProfile` en `RequireRole` o crear un `RequireCompletedProfile` component.

---

#### 3.3.2 — Google Login implementado pero sin UI

**Estado: ⚠️ ATENCIÓN**

`loginWithGoogle` existe en `authStore.ts` (líneas 450-468) y tiene implementación completa con `signInWithOAuth`. Sin embargo, la búsqueda en toda la carpeta `src/` del string `loginWithGoogle` solo encuentra las dos ocurrencias en `authStore.ts`. **Ningún componente llama a esta función**. El botón "Login con Google" no existe en la UI.

**Decisión:** O agregar el botón en `Login.tsx`, o remover la función del store para evitar código muerto.

---

---

## 4. 🧪 TESTING

#### 4.1.1 — Auth flow E2E Coach

**Estado: 🔵 N/A (requiere ejecución)**

No hay tests automatizados escritos. Se puede verificar manualmente.

---

#### 4.2.1 — Alumno sin plan asignado

**Estado: ✅ PASA**

`useActiveAssignment` devuelve `null` cuando no hay asignación. El componente `TrainingHome` debe manejar este estado. Verificar que muestre un mensaje apropiado.

---

#### 4.2.2 — Datos numéricos extremos

**Estado: ⚠️ ATENCIÓN**

La BD tiene constraints (100-250 para altura, 30-300 para peso, 1-10 para RPE). El frontend en `studentProfileSchema.ts` también debería tener estas validaciones en Zod. Verificar que el schema de Zod los valida antes de que lleguen a Supabase.

---

---

## 5. 🛠️ INFRAESTRUCTURA & DEPLOY

#### 5.1.1 — Variables de entorno de producción (Firebase)

**Estado: ❌ FALLA**

El `testing.md` lista 8 variables `VITE_FIREBASE_*` como necesarias. Pero **Firebase no se usa en ningún archivo**. Estas variables no deben configurarse en el hosting de producción porque:

1. Son código muerto.
2. Exponen API keys de Firebase sin propósito.

**Acción:** Remover del `.env` y del hosting todas las `VITE_FIREBASE_*`.

---

#### 5.2.1 — Console.log en producción

**Estado: ❌ FALLA**

Hay decenas de `console.log` en producción. Sin embargo, **el `vite.config.ts` ya tiene configurado** (gracias al fix anterior):

```ts
drop: mode === 'production' ? (['console', 'debugger'] as const) : [],
```

Esto elimina automáticamente todos los `console.*` del bundle de producción durante el build. ✅ El problema está **resuelto** por la configuración de esbuild.

---

---

## 6. 🎨 UX & CALIDAD

#### 6.3.1 — Consistencia de idioma

**Estado: ⚠️ ATENCIÓN**

Los `console.log` tienen mezcla de español/inglés (`[completeStudentProfile] 🚀 INICIANDO`, `Auth state changed:`, `Token refreshed successfully`). Dado que el `vite.config.ts` ya elimina los console en producción, esto solo afecta al desarrollo.

---

---

## Resumen Ejecutivo

| #     | Test                                           | Estado      | Archivo                   | Línea | Prioridad |
| ----- | ---------------------------------------------- | ----------- | ------------------------- | ----- | --------- |
| 1.1.2 | Doble sistema auth (Firebase)                  | ✅ PASA     | `firebase.ts`             | —     | —         |
| 1.1.3 | Token de sesión (tokenExpiry es código muerto) | ⚠️ ATENCIÓN | `authStore.ts`            | 71    | 🟡        |
| 1.2.1 | RLS en todas las tablas                        | ❌ FALLA    | Supabase DB               | —     | 🔴        |
| 1.2.3 | Coach solo ve sus alumnos                      | ❌ FALLA    | `useStudents.ts`          | 75    | 🔴        |
| 1.3.2 | Validación backend storage                     | ⚠️ ATENCIÓN | `supabase-storage.ts`     | 37    | 🟠        |
| 1.4.1 | .gitignore faltante                            | ❌ FALLA    | raíz del proyecto         | —     | 🔴        |
| 2.1.4 | setTimeout en StudentProfileSetup              | ❌ FALLA    | `StudentProfileSetup.tsx` | 110   | 🟡        |
| 2.3.2 | Bug `full_name`/`avatar_url` inexistentes      | ❌ FALLA    | `useTrainingPlans.ts`     | 699   | 🔴        |
| 3.1.4 | Mood check salteable por URL directa           | ❌ FALLA    | `router/index.tsx`        | 125   | 🟠        |
| 3.2.1 | Doble asignación del mismo plan                | ❌ FALLA    | `useTrainingPlans.ts`     | 613   | 🟠        |
| 3.3.1 | Alumno sin perfil accede a /entrenamiento      | ❌ FALLA    | `router/index.tsx`        | 103   | 🔴        |
| 3.3.2 | loginWithGoogle sin UI                         | ⚠️ ATENCIÓN | `authStore.ts`            | 450   | 🟡        |
| 5.1.1 | Variables Firebase innecesarias                | ❌ FALLA    | `.env`                    | —     | 🟠        |

### Bugs Críticos a Corregir antes de Producción

1. 🔴 **RLS sin políticas** → ejecutar `plan-seguridad-rls.md`
2. 🔴 **Bug `full_name`/`avatar_url`** → alumnos asignados aparecen como "Sin nombre"
3. 🔴 **Alumno sin perfil puede acceder a `/entrenamiento`** → agregar guard `hasCompletedProfile`
4. 🔴 **`.gitignore` faltante** → crear inmediatamente
5. 🟠 **Doble asignación del mismo plan** → agregar validación en `assignPlanToStudents`
6. 🟡 **setTimeout de 1.5s al completar perfil** → eliminar
