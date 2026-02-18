# Cambio: Exercise Stages Compartidos

## Resumen
Los **exercise stages** ahora son compartidos entre todos los coaches de la plataforma, en lugar de ser privados de cada coach.

## ¿Qué cambió?

### Antes ✗
- Cada coach tenía sus propios stages (Fuerza A, Fuerza B, etc.)
- Los stages tenían una columna `coach_id`
- Las políticas RLS filtraban por `auth.uid() = coach_id`
- Cada coach veía solo sus stages

### Ahora ✓
- Los stages son compartidos entre TODOS los coaches
- No hay columna `coach_id` en la tabla
- Las políticas RLS verifican que el usuario sea coach (rol = 'coach')
- Cualquier coach puede ver, crear, editar y eliminar stages

## Archivos modificados

- ✅ `TRAINING_SCHEMA_CLEAN.sql` - Schema principal con RLS
- ✅ `TRAINING_SCHEMA_SIMPLE.sql` - Schema simplificado sin RLS
- ✅ `TRAINING_SCHEMA.sql` - Schema completo con IF NOT EXISTS
- ✅ `MIGRATION_exercise_stages_shared.sql` - Script de migración

## Migración de base de datos existente

Si ya tienes la tabla `exercise_stages` creada en tu base de datos de Supabase:

1. **Abre Supabase SQL Editor**
2. **Ejecuta el script:** `MIGRATION_exercise_stages_shared.sql`
3. **Verifica:** Todos los stages deberían aparecer para todos los coaches

⚠️ **Nota:** Si tenías stages duplicados entre coaches (ej: "Fuerza A" de coach 1 y "Fuerza A" de coach 2), ambos se consolidarán en una lista compartida. Puedes renombrarlos antes de la migración si quieres distinguirlos.

## Código frontend

El código frontend **ya estaba preparado** para este cambio:
- ✅ `ExerciseStage` type no incluye `coach_id`
- ✅ `useExerciseStages` hook no inserta `coach_id`
- ✅ Componentes tratan stages como recursos compartidos

No se necesitan cambios en el código TypeScript/React.

## Beneficios

✅ **Colaboración:** Todos los coaches comparten la misma nomenclatura  
✅ **Consistencia:** No hay duplicación de stages  
✅ **Simplicidad:** Menos complejidad en políticas RLS  
✅ **Escalabilidad:** Fácil agregar stages predefinidos para toda la plataforma
