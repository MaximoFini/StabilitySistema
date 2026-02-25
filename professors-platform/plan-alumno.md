# 🏋️ Prompt para Copilot en VS Code

## Conexión Plan del Profe → Vista del Alumno + Progreso en Calendario

**Proyecto:** `professors-platform/`
**Stack:** React + TypeScript + Vite + Supabase + Zustand + Sonner

### ⚠️ REGLAS ABSOLUTAS

- NO instalar dependencias nuevas.
- NO cambiar diseño visual de ningún componente (colores, layout, tipografía).
- NO romper ninguna funcionalidad existente (coach, library, NewPlan, auth).
- NO eliminar `MOCK_PLAN` — conservar como fallback de TypeScript.
- Usar los skills de `.agents/skills/` cuando corresponda.

---

## 🗄️ PASO 0 — Antes de codear (Manual en Supabase)

> Ejecutar este SQL en el editor de Supabase antes de empezar cualquier fase.

```sql
CREATE TABLE workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES training_plan_assignments(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rpe INTEGER,
  total_sets_done INTEGER,
  series_log JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_workout_completions_student_id ON workout_completions(student_id);
CREATE INDEX idx_workout_completions_assignment_id ON workout_completions(assignment_id);
CREATE INDEX idx_workout_completions_completed_at ON workout_completions(completed_at);
```

---

## 📋 CONTEXTO DE TABLAS SUPABASE RELEVANTES

Tablas ya existentes:

- `training_plan_assignments` — contiene `current_day_number`, `completed_days`, `status`, `plan_id`, `student_id`
- `training_plan_days` — contiene `id`, `plan_id`, `day_number`, `day_name`, `display_order`
- `training_plan_exercises` — contiene `day_id`, `exercise_name`, `series`, `reps`, `pause`, `intensity`, `video_url`, `notes`, `coach_instructions`, `stage_name`, `display_order`

Tabla nueva: `workout_completions` (crear en Paso 0)

---

## 🗺️ MAPA DE ARCHIVOS

### NUEVOS a crear:

```
professors-platform/src/hooks/
  ├── useActiveAssignment.ts
  ├── useActiveDayExercises.ts
  └── useWorkoutCompletions.ts
```

### EXISTENTES a modificar:

```
professors-platform/src/
  ├── lib/
  │   └── supabase.ts                          ← agregar tipo workout_completions
  ├── features/training/
  │   ├── store/
  │   │   └── trainingStore.ts                 ← agregar assignmentId + currentDayNumber al state
  │   ├── TrainingHome.tsx                     ← conectar con plan real
  │   ├── ExerciseList.tsx                     ← leer dayId del param de ruta
  │   ├── WorkoutComplete.tsx                  ← guardar en BD al terminar
  │   └── TrainingProgress.tsx                 ← calendario real con días completados
```

---

## 🚀 FASE 1 — Infraestructura de tipos y store

### 1.1 — `professors-platform/src/lib/supabase.ts`

**Acción:** Agregar la definición de tipo de la tabla `workout_completions` al tipo `Database`.

- Agregar `Row`, `Insert` y `Update` para `workout_completions`.
- Campos: `id`, `student_id`, `assignment_id`, `day_number`, `completed_at`, `rpe`, `total_sets_done`, `series_log`, `notes`, `created_at`.

### 1.2 — `professors-platform/src/features/training/store/trainingStore.ts`

**Acción:** Extender el estado de Zustand sin tocar la lógica existente.

- Agregar al interface `TrainingState`:
  - `assignmentId: string | null`
  - `currentDayNumber: number`
  - `setAssignmentContext: (assignmentId: string, dayNumber: number) => void`
- Inicializar en el estado: `assignmentId: null`, `currentDayNumber: 1`
- Agregar acción `setAssignmentContext` que llama `set({ assignmentId, currentDayNumber: dayNumber })`
- En `resetTraining()`, agregar limpieza: `assignmentId: null, currentDayNumber: 1`
- **NO modificar ni eliminar** `MOCK_PLAN`, `startWorkout`, `goToExercise`, `seriesLog`, `rpe`, ni ninguna acción existente.

---

## 🚀 FASE 2 — Hooks nuevos de Supabase

### 2.1 — `professors-platform/src/hooks/useActiveAssignment.ts` ← CREAR

**Propósito:** Obtener la asignación activa del alumno logueado y el día actual.

- Importar `supabase` desde `@/lib/supabase` y `useAuthStore` desde `@/features/auth/store/authStore`.
- Usar `professor.id` como `student_id`.
- Query 1: `training_plan_assignments` filtrando `student_id = professor.id` y `status = 'active'`, joinear con `training_plans(title, total_days)`, ordenar por `assigned_at desc`, `.limit(1)`.
- Query 2: Con el `plan_id` y `current_day_number` del resultado, buscar en `training_plan_days` el día correspondiente (`day_number = current_day_number`). Si no existe, tomar el primero ordenado por `day_number asc`.
- Query 3: Contar ejercicios del día encontrado en `training_plan_exercises` con `.count('exact', head: true)`.
- Exportar interface `ActiveAssignment` con: `assignmentId`, `planId`, `planTitle`, `currentDayNumber`, `currentDayId` (UUID del `training_plan_days`), `currentDayName`, `totalDays`, `completedDays`, `startDate`, `endDate`, `status`, `exerciseCount`, `estimatedMinutes`.
- Retornar: `{ assignment, loading, error, refetch }`.
- Manejar caso de no asignación: `assignment = null`.

### 2.2 — `professors-platform/src/hooks/useActiveDayExercises.ts` ← CREAR

**Propósito:** Cargar ejercicios de un día y transformarlos al formato `WorkoutDay` del store.

- Recibir `dayId: string | null`. Si es null, retornar `workoutDay = null`.
- Query 1: `training_plan_days` por `id = dayId` para obtener `day_number` y `day_name`.
- Query 2: `training_plan_exercises` filtrando por `day_id = dayId`, ordenando por `display_order asc`.
- Transformación de cada ejercicio de BD al tipo `Exercise` (de `@/features/training/types`):
  - `exercise_name` → `name`
  - `series` (int) → array `sets` de `ExerciseSet[]` con `setNumber`, `targetReps = ex.reps`, `targetWeight = 0`
  - `pause` (string "60s" / "2min") → `restSeconds` (number en segundos)
  - `stage_name` → inferir `category`: si contiene "compuesto" o "principal" → `'Compuesto'`, sino `'Aislamiento'`
  - `notes` + `coach_instructions` combinados → `instructions`
  - `video_url` → `videoUrl`
  - `id` del `Exercise` = index + 1 (número, no UUID)
- Construir `WorkoutDay` con `id = day_number`, `name = day_name`, `durationMinutes` estimado, `exercises`.
- Retornar: `{ workoutDay, loading, error }`.

### 2.3 — `professors-platform/src/hooks/useWorkoutCompletions.ts` ← CREAR

**Propósito:** Cargar historial de workouts completados y exponer `saveCompletion()`.

- Importar `supabase` y `useAuthStore`.
- Query: `workout_completions` filtrando `student_id = professor.id`, ordenando por `completed_at desc`.
- Exportar interface `WorkoutCompletion`: `id`, `assignmentId`, `dayNumber`, `completedAt`, `rpe`, `totalSetsDone`.
- Exportar interface `SaveCompletionParams`: `assignmentId`, `dayNumber`, `rpe`, `totalSetsDone`, `seriesLog`.
- Función `saveCompletion(params)`:
  1. INSERT en `workout_completions`
  2. Leer `training_plan_assignments` actual (joins `training_plans(total_days)`)
  3. Calcular `nextDay = current_day_number + 1`. Si `nextDay > totalDays` → `status = 'completed'`, sino `status = 'active'`
  4. UPDATE `training_plan_assignments`: `current_day_number`, `completed_days + 1`, `status`
  5. Retornar `{ success: boolean, error?: string }`
- Computar `completedDates`: `Set<string>` con fechas `'YYYY-MM-DD'` de los `completedAt`.
- Retornar: `{ completions, completedDates, loading, error, saveCompletion, refetch }`.

---

## 🚀 FASE 3 — Modificar TrainingHome

### `professors-platform/src/features/training/TrainingHome.tsx`

**Acción:** Conectar con el plan real. Mantener el diseño visual sin cambios.

- Importar `useActiveAssignment` y `useActiveDayExercises`.
- Importar `setAssignmentContext` del store.
- Llamar `useActiveAssignment()` → `{ assignment, loading: assignmentLoading }`.
- Llamar `useActiveDayExercises(assignment?.currentDayId ?? null)` → `{ workoutDay, loading: dayLoading }`.
- `isLoading = assignmentLoading || (!!assignment && dayLoading)`.
- **Si `isLoading`:** mostrar skeleton reutilizando los mismos estilos de skeleton ya presentes en la app.
- **Si `!assignment`:** reemplazar el hero card por una card de estado vacío con ícono y texto: _"Tu profe aún no te asignó un plan. ¡Pronto comenzamos!"_ — usar clases visuales del mismo sistema de diseño.
- **Si hay `assignment`:** mostrar en la card del día:
  - Título: `"Día {currentDayNumber} — {currentDayName}"`
  - Pill duración: `"{estimatedMinutes} min"`
  - Pill ejercicios: `"{exerciseCount} ejercicios"`
  - Hero title: `"{planTitle}"`
- En `handleStart()`:
  1. Llamar `setAssignmentContext(assignment.assignmentId, assignment.currentDayNumber)`
  2. Llamar `startWorkout(workoutDay)`
  3. `navigate('/entrenamiento/dia/' + assignment.currentDayId)`
- Eliminar el import de `MOCK_PLAN` (no eliminarlo del archivo fuente, solo no usarlo en este componente).
- Mantener el badge "En curso", el saludo, el avatar y el layout exactamente igual.

---

## 🚀 FASE 4 — Modificar ExerciseList

### `professors-platform/src/features/training/ExerciseList.tsx`

**Acción:** Leer `dayId` desde los params de ruta y usar datos reales.

- Agregar `useParams<{ dayId: string }>()` para leer el UUID del día.
- Si `currentDay` del store ya tiene ejercicios (llegó desde `TrainingHome`), usarlo directamente.
- Si `currentDay` es null (navegación directa a la URL):
  - Llamar `useActiveDayExercises(dayId)`.
  - Cuando `workoutDay` esté disponible, llamar `startWorkout(workoutDay)`.
- Reemplazar el label `"DÍA 1"` hardcodeado por `"DÍA {currentDay.id}"` (el `.id` del `WorkoutDay` es el `day_number`).
- En `handleExerciseClick(index)`: navegar a `/entrenamiento/dia/${dayId}/ejercicio/${index + 1}`.
- En `handleStartAll()`: navegar a `/entrenamiento/dia/${dayId}/ejercicio/1`.
- Eliminar el import de `MOCK_PLAN` de este componente (dejar la exportación en el store).
- **NO cambiar nada del diseño visual** (cards, colores, layout).

---

## 🚀 FASE 5 — Modificar WorkoutComplete

### `professors-platform/src/features/training/WorkoutComplete.tsx`

**Acción:** Guardar el workout en Supabase antes de navegar al inicio.

- Importar `useWorkoutCompletions` desde `@/hooks/useWorkoutCompletions`.
- Leer del store: `assignmentId`, `currentDayNumber`, `seriesLog`.
- Agregar estado local `isSaving: boolean`, inicializado en `false`.
- Modificar `handleGoHome` para que sea `async`:
  1. `setIsSaving(true)`
  2. Si hay `assignmentId`: llamar `saveCompletion({ assignmentId, dayNumber: currentDayNumber, rpe, totalSetsDone: doneSetsCount, seriesLog })`
  3. Si `result.success`: `toast.success('¡Entrenamiento guardado! 💪')` (usar `toast` de `sonner`)
  4. Si error: `toast.error('No se pudo guardar. Intenta de nuevo.')`
  5. `setIsSaving(false)`
  6. `resetTraining()` → `navigate('/entrenamiento', { replace: true })`
- Si **no hay `assignmentId`**: comportamiento actual sin cambios (solo `resetTraining + navigate`).
- En el botón "Volver al Inicio":
  - Durante `isSaving`: mostrar `<span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>` en lugar del ícono home.
  - Deshabilitar con `disabled={isSaving}`.
  - **No cambiar ninguna otra cosa del diseño del botón.**

---

## 🚀 FASE 6 — Modificar TrainingProgress (Calendario Real)

### `professors-platform/src/features/training/TrainingProgress.tsx`

**Acción:** Reemplazar el calendario hardcodeado por uno real con datos de Supabase.

> ⚠️ Si actualmente `TrainingProgress` está exportado desde `TrainingPlaceholders.tsx` como un placeholder, mover la implementación real a un archivo propio `TrainingProgress.tsx` en `professors-platform/src/features/training/` y actualizar el import en el router/layout correspondiente.

- Importar `useWorkoutCompletions` desde `@/hooks/useWorkoutCompletions`.
- Agregar estado local `currentMonth: Date` inicializado en `new Date()`.
- Implementar navegación entre meses: `prevMonth()` y `nextMonth()` actualizan `currentMonth`.
- Mostrar el nombre del mes y año en español con `toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })`.
- Generar la grilla de días del mes calculando `daysInMonth` y `firstDayOfMonth`.
- Para cada día de la grilla, construir la fecha `'YYYY-MM-DD'` y verificar con `completedDates.has(dateStr)`:
  - Día completado → misma clase visual del mock (`bg-primary`, círculo, texto blanco).
  - Día de hoy → `bg-emerald-500` con texto blanco.
  - Día futuro o sin entrenar → clase neutra (`bg-slate-100 dark:bg-slate-800`).
- **Mantener intacto** el encabezado "Tu Evolución", la sección "Constancia", botones chevron_left/chevron_right y todo el layout existente. Solo reemplazar los datos y la lógica del calendario.
- Si `loading` de `useWorkoutCompletions`, mostrar skeleton en el área del calendario.

---

## ✅ FLUJO COMPLETO A VERIFICAR

```
Alumno con plan asignado:
1. /entrenamiento → TrainingHome muestra Día 1 real
2. "COMENZAR RUTINA" → /entrenamiento/dia/{uuid-dia-1}
3. ExerciseList muestra ejercicios reales del plan
4. Ejercicio → /entrenamiento/dia/{dayId}/ejercicio/1
5. ExerciseDetail funciona igual (store ya tiene los datos)
6. Completa todos → /entrenamiento/completado
7. WorkoutComplete: guardar en workout_completions + avanzar day en assignment
8. Volver → TrainingHome ahora muestra Día 2
9. /entrenamiento/progreso → calendario con el día de hoy marcado

Alumno SIN plan asignado:
1. /entrenamiento → card "Tu profe aún no te asignó un plan."

Navegación directa (bookmark a /entrenamiento/dia/:dayId):
1. ExerciseList detecta store vacío → carga desde Supabase → inicia workout
```

---

## 📝 RECORDATORIOS CLAVE PARA COPILOT

- El `authStore` expone `professor` (no `user`) — usar `professor.id` como `student_id`.
- El `id` de `WorkoutDay` es `number` (usa `day_number`), no UUID.
- `MOCK_PLAN` se conserva en `trainingStore.ts` — no eliminarlo.
- `sonner` ya está instalado y configurado en `App.tsx` con `<Toaster />`.
- Los tipos `Exercise`, `ExerciseSet`, `WorkoutDay`, `SeriesLog` están en `professors-platform/src/features/training/types.ts`.
- El router ya tiene `/entrenamiento/dia/:dayId` configurado — no modificar el router.
