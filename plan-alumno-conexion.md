# Conexión Plan del Profe → Vista del Alumno + Registro de Progreso

## 🎯 OBJETIVO

Conectar el sistema de planificación y asignación que ya existe (coach crea y asigna un plan en `training_plan_assignments`) con la experiencia del alumno en `/entrenamiento`, de modo que:

1. El alumno entre a `/entrenamiento` y vea **el día real de su plan** (no el `MOCK_PLAN`).
2. La primera vez que entra, siempre arranca desde el **Día 1**.
3. La navegación y el flujo de workout (ExerciseList → ExerciseDetail → WorkoutComplete) se adapten a los ejercicios reales de ese día.
4. Al completar la rutina, se guarda en Supabase y se incrementa el contador de días. El día completado aparece en el calendario de `/entrenamiento/progreso`.

---

## 📋 CONTEXTO DEL PROYECTO

**Stack:** React + TypeScript + Vite + Supabase + Zustand  
**Proyecto:** `professors-platform/`  
**⚠️ REGLAS ABSOLUTAS:**
- **NO instalar dependencias nuevas.**
- **NO cambiar el diseño visual** de ningún componente existente (colores, layout, tipografía, etc.).
- **NO romper ninguna funcionalidad existente** (coach, library, NewPlan, auth, etc.).
- **NO eliminar el `MOCK_PLAN`** — solo dejar de usarlo como fuente principal cuando haya plan real.
- Los skills en `.agents/skills/` deben usarse cuando corresponda.

---

## 🗄️ TABLAS SUPABASE RELEVANTES (ya existen)

### `training_plan_assignments`
```typescript
{
  id: string;
  plan_id: string;
  student_id: string;
  coach_id: string;
  assigned_at: string;
  start_date: string;         // 'YYYY-MM-DD'
  end_date: string;           // 'YYYY-MM-DD'
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  current_day_number: number; // día actual del alumno (empieza en 1)
  completed_days: number;     // cuántos días terminó
  personalization_notes: string | null;
}
```

### `training_plan_days`
```typescript
{
  id: string;
  plan_id: string;
  day_number: number;  // 1, 2, 3...
  day_name: string;    // ej: "Piernas e Hipertrofia"
  display_order: number;
}
```

### `training_plan_exercises`
```typescript
{
  id: string;
  day_id: string;
  stage_id: string | null;
  stage_name: string;
  exercise_name: string;
  video_url: string | null;
  series: number;       // cantidad de series
  reps: string;         // ej: "10" | "8-12"
  intensity: number;    // 1-10
  pause: string;        // ej: "60s"
  notes: string | null;
  coach_instructions: string | null;
  display_order: number;
}
```

### Nueva tabla a crear: `workout_completions`
```sql
CREATE TABLE workout_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES training_plan_assignments(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rpe INTEGER,                    -- 1-10
  total_sets_done INTEGER,
  series_log JSONB,               -- snapshot del seriesLog de Zustand
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX idx_workout_completions_student_id ON workout_completions(student_id);
CREATE INDEX idx_workout_completions_assignment_id ON workout_completions(assignment_id);
CREATE INDEX idx_workout_completions_completed_at ON workout_completions(completed_at);
```

**Agregar también al tipo `Database` en `professors-platform/src/lib/supabase.ts`:**
```typescript
workout_completions: {
  Row: {
    id: string;
    student_id: string;
    assignment_id: string;
    day_number: number;
    completed_at: string;
    rpe: number | null;
    total_sets_done: number | null;
    series_log: Record<string, unknown> | null;
    notes: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    student_id: string;
    assignment_id: string;
    day_number: number;
    completed_at?: string;
    rpe?: number | null;
    total_sets_done?: number | null;
    series_log?: Record<string, unknown> | null;
    notes?: string | null;
    created_at?: string;
  };
  Update: {
    rpe?: number | null;
    total_sets_done?: number | null;
    series_log?: Record<string, unknown> | null;
    notes?: string | null;
  };
};
```

---

## 🏗️ ARQUITECTURA DE LA SOLUCIÓN

### Flujo general

```
[TrainingHome]
  → useActiveAssignment() busca asignación activa del alumno
  → Si hay plan real: muestra datos del día actual (current_day_number)
  → Si no hay plan: muestra estado "Sin plan asignado"
  → Botón "Comenzar Rutina" → /entrenamiento/dia/:dayId

[ExerciseList]
  → Recibe dayId (UUID del training_plan_days)
  → useActiveDayExercises(dayId) carga ejercicios reales de Supabase
  → Transforma a WorkoutDay compatible con trainingStore
  → startWorkout(workoutDay) → navigate al primer ejercicio

[ExerciseDetail]
  → Sin cambios en lógica de UI
  → El store ya tiene los datos reales gracias a startWorkout()

[WorkoutComplete]
  → Al hacer "Volver al Inicio":
    1. Llama saveWorkoutCompletion() → INSERT en workout_completions
    2. Llama updateAssignmentProgress() → UPDATE training_plan_assignments
    3. resetTraining() → navigate /entrenamiento

[TrainingProgress]
  → useWorkoutCompletions() carga historial de workout_completions
  → Muestra calendario real con días completados
```

---

## 📁 ARCHIVOS A CREAR / MODIFICAR

```
professors-platform/src/
├── hooks/
│   ├── useActiveAssignment.ts    ← NUEVO
│   ├── useActiveDayExercises.ts  ← NUEVO
│   └── useWorkoutCompletions.ts  ← NUEVO
├── features/
│   └── training/
│       ├── TrainingHome.tsx      ← MODIFICAR
│       ├── ExerciseList.tsx      ← MODIFICAR
│       ├── WorkoutComplete.tsx   ← MODIFICAR
│       ├── TrainingProgress.tsx  ← MODIFICAR
│       └── store/
│           └── trainingStore.ts  ← MODIFICAR (agregar assignmentId al state)
└── lib/
    └── supabase.ts               ← MODIFICAR (agregar tipo workout_completions)
```

---

## 🔨 IMPLEMENTACIÓN DETALLADA

---

### FASE 1: Hook `useActiveAssignment`

**Ubicación:** `professors-platform/src/hooks/useActiveAssignment.ts`

**Propósito:** Obtener la asignación activa del alumno logueado, con los datos del plan y el día actual.

```typescript
// professors-platform/src/hooks/useActiveAssignment.ts

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/authStore'

export interface ActiveAssignment {
  assignmentId: string
  planId: string
  planTitle: string
  currentDayNumber: number      // número del día (1, 2, 3...)
  currentDayId: string          // UUID del training_plan_days
  currentDayName: string        // nombre del día
  totalDays: number
  completedDays: number
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  exerciseCount: number         // cantidad de ejercicios del día actual
  estimatedMinutes: number      // estimación basada en series y pausas
}

export function useActiveAssignment() {
  const { professor } = useAuthStore()
  const [assignment, setAssignment] = useState<ActiveAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssignment = useCallback(async () => {
    if (!professor?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 1. Buscar asignación activa del alumno
      const { data: assignments, error: assignError } = await supabase
        .from('training_plan_assignments')
        .select(`
          id,
          plan_id,
          current_day_number,
          completed_days,
          start_date,
          end_date,
          status,
          training_plans (
            title,
            total_days
          )
        `)
        .eq('student_id', professor.id)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false })
        .limit(1)

      if (assignError) throw assignError
      if (!assignments || assignments.length === 0) {
        setAssignment(null)
        setLoading(false)
        return
      }

      const row = assignments[0]
      const plan = row.training_plans as { title: string; total_days: number } | null
      const currentDayNum = row.current_day_number || 1

      // 2. Buscar el día actual en training_plan_days
      const { data: dayRow, error: dayError } = await supabase
        .from('training_plan_days')
        .select('id, day_name')
        .eq('plan_id', row.plan_id)
        .eq('day_number', currentDayNum)
        .single()

      if (dayError || !dayRow) {
        // Si no encuentra el día exacto, tomar el primero
        const { data: firstDay } = await supabase
          .from('training_plan_days')
          .select('id, day_name')
          .eq('plan_id', row.plan_id)
          .order('day_number', { ascending: true })
          .limit(1)
          .single()

        if (!firstDay) {
          setAssignment(null)
          setLoading(false)
          return
        }

        // Contar ejercicios del día
        const { count: exCount } = await supabase
          .from('training_plan_exercises')
          .select('id', { count: 'exact', head: true })
          .eq('day_id', firstDay.id)

        setAssignment({
          assignmentId: row.id,
          planId: row.plan_id,
          planTitle: plan?.title || 'Plan de entrenamiento',
          currentDayNumber: currentDayNum,
          currentDayId: firstDay.id,
          currentDayName: firstDay.day_name,
          totalDays: plan?.total_days || 0,
          completedDays: row.completed_days || 0,
          startDate: row.start_date,
          endDate: row.end_date,
          status: row.status,
          exerciseCount: exCount || 0,
          estimatedMinutes: Math.round(((exCount || 0) * 3 * 2) + ((exCount || 0) * 3 * 0.5)),
        })
        return
      }

      // 3. Contar ejercicios del día actual
      const { count: exerciseCount } = await supabase
        .from('training_plan_exercises')
        .select('id', { count: 'exact', head: true })
        .eq('day_id', dayRow.id)

      const exCount = exerciseCount || 0
      // Estimación: (series * pausa promedio en min) + (series * tiempo por serie)
      const estimatedMinutes = Math.round(exCount * 3 * 2 + exCount * 3 * 0.5)

      setAssignment({
        assignmentId: row.id,
        planId: row.plan_id,
        planTitle: plan?.title || 'Plan de entrenamiento',
        currentDayNumber: currentDayNum,
        currentDayId: dayRow.id,
        currentDayName: dayRow.day_name,
        totalDays: plan?.total_days || 0,
        completedDays: row.completed_days || 0,
        startDate: row.start_date,
        endDate: row.end_date,
        status: row.status,
        exerciseCount: exCount,
        estimatedMinutes,
      })
    } catch (err) {
      console.error('[useActiveAssignment] error:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el plan')
    } finally {
      setLoading(false)
    }
  }, [professor?.id])

  useEffect(() => {
    fetchAssignment()
  }, [fetchAssignment])

  return { assignment, loading, error, refetch: fetchAssignment }
}
```

---

### FASE 2: Hook `useActiveDayExercises`

**Ubicación:** `professors-platform/src/hooks/useActiveDayExercises.ts`

**Propósito:** Cargar los ejercicios de un día del plan y transformarlos al formato `WorkoutDay` que usa el `trainingStore`.

```typescript
// professors-platform/src/hooks/useActiveDayExercises.ts

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { WorkoutDay, Exercise, ExerciseSet } from '@/features/training/types'

export function useActiveDayExercises(dayId: string | null) {
  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!dayId) {
      setWorkoutDay(null)
      return
    }

    const fetchExercises = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch the day info
        const { data: dayData, error: dayError } = await supabase
          .from('training_plan_days')
          .select('id, day_number, day_name')
          .eq('id', dayId)
          .single()

        if (dayError || !dayData) throw dayError || new Error('Día no encontrado')

        // Fetch exercises ordered by display_order
        const { data: exercises, error: exError } = await supabase
          .from('training_plan_exercises')
          .select('*')
          .eq('day_id', dayId)
          .order('display_order', { ascending: true })

        if (exError) throw exError

        const dbExercises = exercises || []

        // Transform to WorkoutDay format compatible with trainingStore
        const transformedExercises: Exercise[] = dbExercises.map((ex, index) => {
          // Parse reps: "10" | "8-12" | "10x3" → use as targetReps string
          const seriesCount = ex.series || 3

          // Build sets array from series count
          const sets: ExerciseSet[] = Array.from({ length: seriesCount }, (_, i) => ({
            setNumber: i + 1,
            targetReps: ex.reps || '10',
            targetWeight: 0,  // student will fill during workout
          }))

          // Parse pause: "60s" | "90s" | "2min" → seconds
          let restSeconds = 60
          if (ex.pause) {
            const pauseStr = ex.pause.toLowerCase()
            if (pauseStr.includes('min')) {
              const mins = parseFloat(pauseStr)
              restSeconds = isNaN(mins) ? 60 : mins * 60
            } else {
              const secs = parseFloat(pauseStr)
              restSeconds = isNaN(secs) ? 60 : secs
            }
          }

          // Determine category based on stage_name
          const stageLower = (ex.stage_name || '').toLowerCase()
          const category: 'Compuesto' | 'Aislamiento' =
            stageLower.includes('compuesto') || stageLower.includes('principal')
              ? 'Compuesto'
              : 'Aislamiento'

          return {
            id: index + 1,   // use numeric index for store compatibility
            name: ex.exercise_name,
            category,
            sets,
            restSeconds,
            videoUrl: ex.video_url || undefined,
            instructions: [ex.notes, ex.coach_instructions]
              .filter(Boolean)
              .join('\n') || undefined,
          }
        })

        // Estimate duration: sum of (sets * rest) + workout time
        const totalSets = transformedExercises.reduce((acc, ex) => acc + ex.sets.length, 0)
        const avgRest = transformedExercises.reduce((acc, ex) => acc + ex.restSeconds, 0) / (transformedExercises.length || 1)
        const estimatedMinutes = Math.round((totalSets * avgRest) / 60 + totalSets * 0.5)

        const workout: WorkoutDay = {
          id: dayData.day_number,
          name: dayData.day_name,
          durationMinutes: estimatedMinutes || 45,
          exercises: transformedExercises,
        }

        setWorkoutDay(workout)
      } catch (err) {
        console.error('[useActiveDayExercises] error:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar ejercicios')
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [dayId])

  return { workoutDay, loading, error }
}
```

---

### FASE 3: Hook `useWorkoutCompletions`

**Ubicación:** `professors-platform/src/hooks/useWorkoutCompletions.ts`

**Propósito:** Cargar el historial de días completados del alumno para mostrar en el calendario de progreso.

```typescript
// professors-platform/src/hooks/useWorkoutCompletions.ts

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/authStore'

export interface WorkoutCompletion {
  id: string
  assignmentId: string
  dayNumber: number
  completedAt: string   // ISO date string
  rpe: number | null
  totalSetsDone: number | null
}

export interface SaveCompletionParams {
  assignmentId: string
  dayNumber: number
  rpe: number | null
  totalSetsDone: number
  seriesLog: Record<string, unknown>
}

export function useWorkoutCompletions() {
  const { professor } = useAuthStore()
  const [completions, setCompletions] = useState<WorkoutCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompletions = useCallback(async () => {
    if (!professor?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('workout_completions')
        .select('id, assignment_id, day_number, completed_at, rpe, total_sets_done')
        .eq('student_id', professor.id)
        .order('completed_at', { ascending: false })

      if (fetchError) throw fetchError

      setCompletions(
        (data || []).map((row) => ({
          id: row.id,
          assignmentId: row.assignment_id,
          dayNumber: row.day_number,
          completedAt: row.completed_at,
          rpe: row.rpe,
          totalSetsDone: row.total_sets_done,
        }))
      )
    } catch (err) {
      console.error('[useWorkoutCompletions] error:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }, [professor?.id])

  useEffect(() => {
    fetchCompletions()
  }, [fetchCompletions])

  // Save a completed workout to DB + update assignment progress
  const saveCompletion = async (params: SaveCompletionParams): Promise<{ success: boolean; error?: string }> => {
    if (!professor?.id) return { success: false, error: 'Usuario no autenticado' }

    try {
      // 1. Insert into workout_completions
      const { error: insertError } = await supabase
        .from('workout_completions')
        .insert({
          student_id: professor.id,
          assignment_id: params.assignmentId,
          day_number: params.dayNumber,
          rpe: params.rpe,
          total_sets_done: params.totalSetsDone,
          series_log: params.seriesLog as Record<string, unknown>,
        })

      if (insertError) throw insertError

      // 2. Fetch current assignment state
      const { data: currentAssignment, error: fetchError } = await supabase
        .from('training_plan_assignments')
        .select('current_day_number, completed_days, total_days:training_plans(total_days)')
        .eq('id', params.assignmentId)
        .single()

      if (fetchError) throw fetchError

      const currentDay = (currentAssignment as { current_day_number: number }).current_day_number || 1
      const completedDays = ((currentAssignment as { completed_days: number }).completed_days || 0) + 1
      // Access total_days via the joined plan
      const totalDaysRaw = (currentAssignment as { total_days?: unknown }).total_days
      const totalDays = typeof totalDaysRaw === 'object' && totalDaysRaw !== null
        ? (totalDaysRaw as { total_days?: number }).total_days || 0
        : 0
      const nextDay = currentDay + 1
      const isFinished = nextDay > totalDays

      // 3. Update assignment: advance day or mark completed
      const { error: updateError } = await supabase
        .from('training_plan_assignments')
        .update({
          current_day_number: isFinished ? currentDay : nextDay,
          completed_days: completedDays,
          status: isFinished ? 'completed' : 'active',
        })
        .eq('id', params.assignmentId)

      if (updateError) throw updateError

      // Refresh local state
      await fetchCompletions()

      return { success: true }
    } catch (err) {
      console.error('[useWorkoutCompletions] saveCompletion error:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al guardar entrenamiento',
      }
    }
  }

  // Returns a Set of date strings 'YYYY-MM-DD' where workouts were done
  const completedDates = new Set(
    completions.map((c) => c.completedAt.split('T')[0])
  )

  return { completions, completedDates, loading, error, saveCompletion, refetch: fetchCompletions }
}
```

---

### FASE 4: Modificar `trainingStore.ts`

**Archivo:** `professors-platform/src/features/training/store/trainingStore.ts`

**Cambios:** Agregar `assignmentId` y `currentDayNumber` al estado para que `WorkoutComplete` pueda guardar el resultado.

**Agregar al interface `TrainingState`:**
```typescript
assignmentId: string | null       // ID de la asignación activa
currentDayNumber: number          // Número de día (para guardar en BD)
setAssignmentContext: (assignmentId: string, dayNumber: number) => void
```

**Agregar al estado inicial y acciones:**
```typescript
// Estado inicial:
assignmentId: null,
currentDayNumber: 1,

// Acción nueva:
setAssignmentContext: (assignmentId, dayNumber) => {
  set({ assignmentId, dayNumber: dayNumber })
},

// En resetTraining(), también limpiar:
assignmentId: null,
currentDayNumber: 1,
```

---

### FASE 5: Modificar `TrainingHome.tsx`

**Archivo:** `professors-platform/src/features/training/TrainingHome.tsx`

**Objetivo:** Reemplazar el `MOCK_PLAN` hardcodeado por los datos reales del plan asignado. Mantener el **diseño visual intacto** — solo cambiar los datos que se muestran.

**Cambios:**
1. Importar `useActiveAssignment` y `useActiveDayExercises`.
2. Si hay asignación activa, mostrar datos reales (nombre del plan, día actual, ejercicios del día).
3. Si **no hay asignación activa**, mostrar un estado vacío claro: card con ícono y texto "Tu profe aún no te asignó un plan. ¡Pronto comenzamos!".
4. Al presionar "COMENZAR RUTINA", navegar a `/entrenamiento/dia/:currentDayId` (UUID del día).
5. Antes de navegar, llamar `setAssignmentContext(assignmentId, currentDayNumber)` y `startWorkout(workoutDay)`.

**IMPORTANTE sobre el skeleton/loading:** Reusar los mismos estilos de skeleton que ya existen o mostrar el mismo spinner que usa la app. No inventar nuevos.

**Estructura lógica:**
```tsx
export default function TrainingHome() {
  const navigate = useNavigate()
  const { professor } = useAuthStore()
  const startWorkout = useTrainingStore((s) => s.startWorkout)
  const setAssignmentContext = useTrainingStore((s) => s.setAssignmentContext)

  const { assignment, loading: assignmentLoading } = useActiveAssignment()
  const { workoutDay, loading: dayLoading } = useActiveDayExercises(
    assignment?.currentDayId ?? null
  )

  const isLoading = assignmentLoading || (!!assignment && dayLoading)

  const handleStart = () => {
    if (!assignment || !workoutDay) return
    setAssignmentContext(assignment.assignmentId, assignment.currentDayNumber)
    startWorkout(workoutDay)
    navigate(`/entrenamiento/dia/${assignment.currentDayId}`)
  }

  // Si está cargando: mostrar skeleton (mismo estilo visual existente)
  // Si no hay asignación: mostrar card "Sin plan asignado"
  // Si hay asignación: mostrar card del día con datos reales
  // El resto del layout (header, stats row, week strip) permanece igual
}
```

**Datos a mostrar cuando hay plan real:**
- "Tu Entrenamiento de Hoy" → "Día {currentDayNumber} — {currentDayName}"
- Pill de duración → `"{estimatedMinutes} min"`
- Pill de ejercicios → `"{exerciseCount} ejercicios"`
- Hero title → `"{planTitle}"`
- Week strip → mantener mock por ahora (se reemplaza en Fase 7)
- Metrics row → mantener valores estáticos (se mejoran en futuras iteraciones)

---

### FASE 6: Modificar `ExerciseList.tsx`

**Archivo:** `professors-platform/src/features/training/ExerciseList.tsx`

**Objetivo:** Recibir el `dayId` (UUID) desde los params de ruta y cargar ejercicios reales. Si el store ya tiene datos (porque se navegó desde `TrainingHome`), usarlos directamente. Si no (navegación directa a la URL), cargarlos desde Supabase.

**Cambios:**
1. Leer `dayId` desde `useParams<{ dayId: string }>()`.
2. Si `currentDay` del store ya tiene ejercicios, usarlo.
3. Si `currentDay` es null (bootstrap directo), cargar con `useActiveDayExercises(dayId)` y llamar `startWorkout(workoutDay)`.
4. El label "DÍA 1" hardcodeado → reemplazar por `"DÍA {currentDay.id}"` (el `id` del `WorkoutDay` es el `day_number`).
5. Mantener el diseño visual completamente igual, solo cambiar la fuente de datos.

**IMPORTANTE:** La ruta ya es `/entrenamiento/dia/:dayId` — el router ya está configurado correctamente. Solo hay que leer el param.

---

### FASE 7: Modificar `WorkoutComplete.tsx`

**Archivo:** `professors-platform/src/features/training/WorkoutComplete.tsx`

**Objetivo:** Al presionar "Volver al Inicio", guardar el workout completado en Supabase antes de navegar.

**Cambios:**
1. Importar `useWorkoutCompletions`.
2. Obtener `assignmentId`, `currentDayNumber` y `seriesLog` del store.
3. Agregar estado `isSaving` para mostrar loading en el botón.
4. En `handleGoHome`:
   - Si hay `assignmentId`, llamar `saveCompletion(...)`.
   - Mostrar toast de éxito o error (ya existe `sonner` en el proyecto).
   - Luego `resetTraining()` y `navigate('/entrenamiento', { replace: true })`.
5. **Si no hay `assignmentId`** (alumno sin plan real asignado): comportamiento actual sin cambios.

```tsx
const handleGoHome = async () => {
  setIsSaving(true)
  
  if (assignmentId) {
    const doneSetsCount = Object.values(seriesLog).filter((s) => s.done).length
    const result = await saveCompletion({
      assignmentId,
      dayNumber: currentDayNumber,
      rpe: rpe,
      totalSetsDone: doneSetsCount,
      seriesLog: seriesLog as Record<string, unknown>,
    })
    
    if (result.success) {
      toast.success('¡Entrenamiento guardado! 💪')
    } else {
      toast.error('No se pudo guardar. Intenta de nuevo.')
    }
  }
  
  setIsSaving(false)
  resetTraining()
  navigate('/entrenamiento', { replace: true })
}
```

**UI del botón durante saving:**
- Mostrar spinner en lugar del ícono `home` mientras `isSaving` es true.
- Usar el mismo spinner de la app: `<span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>`.
- Deshabilitar el botón durante `isSaving`.

---

### FASE 8: Modificar `TrainingProgress.tsx`

**Archivo:** `professors-platform/src/features/training/TrainingProgress.tsx`

**Objetivo:** Reemplazar el calendario hardcodeado (mock de "Octubre 2023") por un calendario real que muestre los días completados.

**Cambios:**
1. Importar `useWorkoutCompletions`.
2. Estado local: `currentMonth` (Date, inicia en el mes actual).
3. Renderizar un calendario mensual real:
   - Navegar entre meses con chevron_left / chevron_right.
   - Mostrar el nombre del mes y año en español.
   - Grilla de días del mes.
   - Días donde `completedDates` tiene la fecha → marcar como completados (mismo estilo visual del mock: `bg-primary`).
   - Día de hoy → marcar con `bg-emerald-500` (igual que en el mock de `WorkoutComplete`).
   - Días futuros → `bg-slate-100 dark:bg-slate-800`.
4. Mantener el **diseño visual** del encabezado, sección "Constancia" y el resto del layout. Solo reemplazar los datos del calendario.

**Lógica del calendario:**
```tsx
export function TrainingProgress() {
  const { completedDates, loading } = useWorkoutCompletions()
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const monthLabel = currentMonth.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })

  // Generar días del mes
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0=Sun

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // Render grid of days...
  // For each day: check if completedDates.has('YYYY-MM-DD')
}
```

---

## 🗺️ CAMBIOS EN ROUTER

El router **ya está configurado correctamente** para las rutas de entrenamiento:
```
/entrenamiento/dia/:dayId          → ExerciseList
/entrenamiento/dia/:dayId/ejercicio/:exerciseNum → ExerciseDetail
/entrenamiento/completado          → WorkoutComplete
```

No se necesitan cambios en el router.

---

## 🧪 FLUJO COMPLETO A VERIFICAR

### Alumno con plan asignado:
1. Alumno entra a `/entrenamiento` → ve `TrainingHome` con datos reales del Día 1.
2. Presiona "COMENZAR RUTINA" → navega a `/entrenamiento/dia/{uuid-del-dia-1}`.
3. `ExerciseList` muestra ejercicios reales del plan.
4. Presiona un ejercicio → navega a `/entrenamiento/dia/{dayId}/ejercicio/1`.
5. `ExerciseDetail` muestra el ejercicio real con series/reps/pausa/video del plan.
6. Completa todos los ejercicios → redirect a `/entrenamiento/completado`.
7. `WorkoutComplete` muestra resumen. Presiona "Volver al Inicio":
   - Se guarda en `workout_completions`.
   - Se actualiza `training_plan_assignments.current_day_number` → 2.
   - Navigate a `/entrenamiento`.
8. `TrainingHome` ahora muestra el **Día 2**.
9. En `/entrenamiento/progreso` → calendario muestra el día de hoy como completado.

### Alumno sin plan asignado:
1. Entra a `/entrenamiento` → ve card "Sin plan asignado".
2. El flujo completo de workout no es accesible.

### Navegación directa a `/entrenamiento/dia/:dayId` (ej: bookmark):
1. `ExerciseList` detecta que el store no tiene datos.
2. Carga el día desde Supabase usando el `dayId` del param.
3. Inicia el workout normalmente.

---

## ✅ ENTREGABLES ESPERADOS

1. ✅ Hook `useActiveAssignment` — busca asignación activa del alumno logueado.
2. ✅ Hook `useActiveDayExercises` — carga ejercicios reales y los transforma a `WorkoutDay`.
3. ✅ Hook `useWorkoutCompletions` — carga historial y expone `saveCompletion()`.
4. ✅ Tabla `workout_completions` creada en Supabase + tipo agregado a `supabase.ts`.
5. ✅ `trainingStore.ts` — `assignmentId` y `currentDayNumber` en el estado.
6. ✅ `TrainingHome` — muestra datos reales del plan asignado (o estado vacío).
7. ✅ `ExerciseList` — carga ejercicios reales del día (UUID del param).
8. ✅ `WorkoutComplete` — guarda en BD al completar y avanza el día en la asignación.
9. ✅ `TrainingProgress` — calendario real con días completados desde BD.
10. ✅ Sin cambios visuales en ningún componente.
11. ✅ Sin dependencias nuevas instaladas.
12. ✅ Compatibilidad total con el flujo coach (NewPlan, assignPlanToStudents) — no romper nada.

---

## 📝 NOTAS IMPORTANTES PARA EL AGENTE

1. **El `MOCK_PLAN` en `trainingStore.ts` NO se elimina** — se conserva como fallback por si el store necesita un default para evitar errores de TypeScript. Solo deja de ser la fuente principal.

2. **La tabla `workout_completions` debe crearse manualmente en Supabase** antes de ejecutar el código. Incluir el SQL en un comentario al inicio del hook `useWorkoutCompletions.ts` para referencia.

3. **El `professor` del authStore tiene `id: string` y `role: 'student' | 'coach'`** — los alumnos tienen role `'student'`. Verificar siempre que el usuario sea student antes de cargar la asignación.

4. **Transformación de `training_plan_exercises` → `WorkoutDay`:** Los campos difieren:
   - `exercise_name` → `name`
   - `series` (int) → `sets` (array de `ExerciseSet`)
   - `reps` (string) → `targetReps` en cada set
   - `pause` (string como "60s") → `restSeconds` (number)
   - No hay `category` en BD → inferir desde `stage_name` o default a `'Aislamiento'`
   - No hay `instructions` directas → combinar `notes` + `coach_instructions`

5. **El `id` de `WorkoutDay` es `number`**, no UUID. Usar el `day_number` (1, 2, 3...) como `id` del `WorkoutDay` para compatibilidad con el store.

6. **Usar `sonner` (ya instalado)** para todos los toasts de éxito/error.

7. **El authStore expone `professor` (no `user`)** — usar `professor.id` para el `student_id`.

8. **Usa los skills de `.agents/skills/`** cuando corresponda para mejorar calidad y consistencia.

---

**¡Adelante! El objetivo es una conexión limpia, sin cambios visuales, que haga que el alumno vea y complete su plan real. 🚀

