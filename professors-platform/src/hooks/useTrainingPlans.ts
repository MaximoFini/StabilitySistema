import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../features/auth/store/authStore";
import { useDataCacheStore } from "../store/dataCacheStore";
import type { PlanExercise } from "../lib/types";
import type { Professor } from "../features/auth/store/authStore";

interface Day {
  id: string;
  number: number;
  name: string;
}

interface SavePlanData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  days: Day[];
  exercises: PlanExercise[];
  isTemplate: boolean;
  durationWeeks?: number;
  daysPerWeek?: number;
}

export interface TrainingPlanSummary {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  total_days: number;
  days_per_week: number;
  total_weeks: number;
  plan_type: string | null;
  difficulty_level: string | null;
  is_template: boolean;
  is_archived: boolean;
  created_at: string;
  assignedCount: number;
}

interface AuthState {
  professor: Professor | null;
}

const formatLocalDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function useTrainingPlans() {
  const professor = useAuthStore((state: AuthState) => state.professor);

  // Read from shared cache store
  const plans = useDataCacheStore((s) => s.plans);
  const isLoaded = useDataCacheStore((s) => s.isPlansLoaded);
  const isLoading = useDataCacheStore((s) => s.isPlansLoading);
  const fetchPlans = useDataCacheStore((s) => s.fetchPlans);
  const reloadPlans = useDataCacheStore((s) => s.reloadPlans);

  useEffect(() => {
    if (!professor) return;
    fetchPlans(professor.id);
  }, [professor, fetchPlans, isLoaded]);

  /** Invalida la caché y re-fetcha. Llamar tras cualquier mutación. */
  const invalidateAndReload = (professorId: string) => {
    reloadPlans();
    fetchPlans(professorId);
  };

  // Keep a stable reference for the mutator functions below
  const professorId = professor?.id ?? "";
  const loading = isLoading && !isLoaded;

  const savePlan = async (planData: SavePlanData) => {
    if (!professor) {
      return { success: false, error: "No hay usuario autenticado" };
    }

    try {
      // Calculate plan metadata
      const totalDays = planData.days.length;
      const msPerDay = 24 * 60 * 60 * 1000;
      const totalDaysInPeriod =
        Math.ceil(
          (planData.endDate.getTime() - planData.startDate.getTime()) /
          msPerDay,
        ) + 1;
      const calculatedWeeks = Math.ceil(totalDaysInPeriod / 7);
      const totalWeeks = planData.durationWeeks ?? calculatedWeeks;
      const daysPerWeek = planData.daysPerWeek ?? totalDays;
      console.log(
        "[savePlan] duration_weeks:",
        totalWeeks,
        "days_per_week:",
        daysPerWeek,
        "(user provided:",
        !!planData.durationWeeks,
        ")",
      );

      // 1. Insert the main training plan
      const { data: insertedPlan, error: planError } = await supabase
        .from("training_plans")
        .insert([
          {
            coach_id: professor.id,
            title: planData.title,
            description: planData.description || null,
            start_date: formatLocalDate(planData.startDate),
            end_date: formatLocalDate(planData.endDate),
            total_days: totalDays,
            days_per_week: daysPerWeek,
            total_weeks: totalWeeks,
            plan_type: planData.isTemplate ? "template" : "custom",
            difficulty_level: null,
            is_template: planData.isTemplate,
            is_archived: false,
          },
        ])
        .select()
        .single();

      if (planError) throw planError;
      if (!insertedPlan) throw new Error("No se pudo crear el plan");

      // 2. Insert training plan days
      const daysToInsert = planData.days.map((day, index) => ({
        plan_id: insertedPlan.id,
        day_number: day.number,
        day_name: day.name,
        display_order: index,
      }));

      const { data: insertedDays, error: daysError } = await supabase
        .from("training_plan_days")
        .insert(daysToInsert)
        .select();

      if (daysError) throw daysError;
      if (!insertedDays) throw new Error("No se pudieron crear los días");

      // 3. Create a mapping from old day IDs to new day IDs
      const dayIdMap = new Map<string, string>();
      planData.days.forEach((originalDay, index) => {
        dayIdMap.set(originalDay.id, insertedDays[index].id);
      });

      // 4. Insert training plan exercises
      const exercisesToInsert = planData.exercises
        .filter((ex) => ex.day_id) // Ensure exercise has a day
        .map((ex, index) => {
          const newDayId = dayIdMap.get(ex.day_id);
          if (!newDayId) {
            console.warn(`Could not find new day ID for exercise ${ex.id}`);
            return null;
          }

          return {
            day_id: newDayId,
            stage_id: ex.stage_id || null,
            stage_name: ex.stage_name,
            exercise_name: ex.exercise_name,
            video_url: ex.video_url || null,
            series: ex.series,
            reps: ex.reps,
            carga: ex.carga || '-',
            pause: ex.pause,
            notes: ex.notes || null,
            coach_instructions: null,
            display_order: index,
            write_weight: ex.write_weight ?? false,
          };
        })
        .filter((ex) => ex !== null);

      if (exercisesToInsert.length > 0) {
        const { error: exercisesError } = await supabase
          .from("training_plan_exercises")
          .insert(exercisesToInsert);

        if (exercisesError) throw exercisesError;
      }

      // Invalidate cache so the list refreshes
      invalidateAndReload(professorId);

      return { success: true, planId: insertedPlan.id };
    } catch (err) {
      console.error("Error saving training plan:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  const updatePlan = async (planId: string, planData: SavePlanData) => {
    if (!professor) {
      return { success: false, error: "No hay usuario autenticado" };
    }

    try {
      // Calculate plan metadata
      const totalDays = planData.days.length;
      const msPerDay = 24 * 60 * 60 * 1000;
      const totalDaysInPeriod =
        Math.ceil(
          (planData.endDate.getTime() - planData.startDate.getTime()) /
          msPerDay,
        ) + 1;
      const calculatedWeeks = Math.ceil(totalDaysInPeriod / 7);
      const totalWeeks = planData.durationWeeks ?? calculatedWeeks;
      const daysPerWeek = planData.daysPerWeek ?? totalDays;
      console.log(
        "[updatePlan] duration_weeks:",
        totalWeeks,
        "days_per_week:",
        daysPerWeek,
        "(user provided:",
        !!planData.durationWeeks,
        ")",
      );

      // 1. Update the main training plan record
      const { error: planError } = await supabase
        .from("training_plans")
        .update({
          title: planData.title,
          description: planData.description || null,
          start_date: formatLocalDate(planData.startDate),
          end_date: formatLocalDate(planData.endDate),
          total_days: totalDays,
          days_per_week: daysPerWeek,
          total_weeks: totalWeeks,
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId)
        .eq("coach_id", professor.id);

      if (planError) throw planError;

      // Sincronizar fechas en las asignaciones de este plan
      const { error: cascadeError } = await supabase
        .from("training_plan_assignments")
        .update({
          start_date: formatLocalDate(planData.startDate),
          end_date: formatLocalDate(planData.endDate),
        })
        .eq("plan_id", planId);

      if (cascadeError) {
        console.warn("Could not sync training plan assignments:", cascadeError);
      }

      // 2. Fetch existing days from DB
      const { data: existingDays, error: fetchDaysError } = await supabase
        .from("training_plan_days")
        .select("id")
        .eq("plan_id", planId);

      if (fetchDaysError) throw fetchDaysError;

      const existingDayIds = new Set(
        (existingDays || []).map((d: { id: string }) => d.id),
      );
      const newDayIds = new Set(planData.days.map((d) => d.id));

      // Categorize days: update existing, insert new, delete removed
      const daysToUpdate = planData.days.filter((d) =>
        existingDayIds.has(d.id),
      );
      const daysToInsert = planData.days.filter(
        (d) => !existingDayIds.has(d.id),
      );
      const dayIdsToDelete = [...existingDayIds].filter(
        (id) => !newDayIds.has(id),
      );

      // 3. Delete removed days (CASCADE handles exercises automatically)
      if (dayIdsToDelete.length > 0) {
        const { error: deleteDaysError } = await supabase
          .from("training_plan_days")
          .delete()
          .in("id", dayIdsToDelete);
        if (deleteDaysError) throw deleteDaysError;
      }

      // 4. Update existing days metadata
      for (const day of daysToUpdate) {
        const dayIndex = planData.days.indexOf(day);
        const { error: updateDayError } = await supabase
          .from("training_plan_days")
          .update({
            day_number: day.number,
            day_name: day.name,
            display_order: dayIndex,
          })
          .eq("id", day.id);
        if (updateDayError) throw updateDayError;
      }

      // 5. Insert new days and build ID map (tempId → newDbId)
      const dayIdMap = new Map<string, string>();
      daysToUpdate.forEach((d) => dayIdMap.set(d.id, d.id)); // existing days map to themselves

      if (daysToInsert.length > 0) {
        const daysToInsertData = daysToInsert.map((day) => ({
          plan_id: planId,
          day_number: day.number,
          day_name: day.name,
          display_order: planData.days.indexOf(day),
        }));

        const { data: insertedDays, error: insertDaysError } = await supabase
          .from("training_plan_days")
          .insert(daysToInsertData)
          .select();

        if (insertDaysError) throw insertDaysError;
        daysToInsert.forEach((day, index) => {
          dayIdMap.set(day.id, insertedDays![index].id);
        });
      }

      // 6. For each existing day, granularly update exercises
      for (const day of daysToUpdate) {
        const dbDayId = dayIdMap.get(day.id)!;
        const dayExercises = planData.exercises.filter(
          (ex) => ex.day_id === day.id,
        );

        const { data: existingExercises, error: fetchExError } = await supabase
          .from("training_plan_exercises")
          .select("id")
          .eq("day_id", dbDayId);

        if (fetchExError) throw fetchExError;

        const existingExIds = new Set(
          (existingExercises || []).map((e: { id: string }) => e.id),
        );
        const newExIds = new Set(dayExercises.map((e) => e.id));

        const exToUpdate = dayExercises.filter((e) => existingExIds.has(e.id));
        const exToInsert = dayExercises.filter((e) => !existingExIds.has(e.id));
        const exIdsToDelete = [...existingExIds].filter(
          (id) => !newExIds.has(id),
        );

        // Delete removed exercises
        if (exIdsToDelete.length > 0) {
          const { error: deleteExError } = await supabase
            .from("training_plan_exercises")
            .delete()
            .in("id", exIdsToDelete);
          if (deleteExError) throw deleteExError;
        }

        // Update existing exercises
        for (const ex of exToUpdate) {
          const { error: updateExError } = await supabase
            .from("training_plan_exercises")
            .update({
              stage_id: ex.stage_id || null,
              stage_name: ex.stage_name,
              exercise_name: ex.exercise_name,
              video_url: ex.video_url || null,
              series: ex.series,
              reps: ex.reps,
              carga: ex.carga || '-',
              pause: ex.pause,
              notes: ex.notes || null,
              display_order: dayExercises.indexOf(ex),
              write_weight: ex.write_weight ?? false,
            })
            .eq("id", ex.id);
          if (updateExError) throw updateExError;
        }

        // Insert new exercises for existing days
        if (exToInsert.length > 0) {
          const { error: insertExError } = await supabase
            .from("training_plan_exercises")
            .insert(
              exToInsert.map((ex) => ({
                day_id: dbDayId,
                stage_id: ex.stage_id || null,
                stage_name: ex.stage_name,
                exercise_name: ex.exercise_name,
                video_url: ex.video_url || null,
                series: ex.series,
                reps: ex.reps,
                carga: ex.carga || '-',
                pause: ex.pause,
                notes: ex.notes || null,
                coach_instructions: null,
                display_order: dayExercises.indexOf(ex),
                write_weight: ex.write_weight ?? false,
              })),
            );
          if (insertExError) throw insertExError;
        }
      }

      // 7. For completely new days, insert all their exercises
      for (const day of daysToInsert) {
        const dbDayId = dayIdMap.get(day.id)!;
        const dayExercises = planData.exercises.filter(
          (ex) => ex.day_id === day.id,
        );

        if (dayExercises.length > 0) {
          const { error: insertExError } = await supabase
            .from("training_plan_exercises")
            .insert(
              dayExercises.map((ex, idx) => ({
                day_id: dbDayId,
                stage_id: ex.stage_id || null,
                stage_name: ex.stage_name,
                exercise_name: ex.exercise_name,
                video_url: ex.video_url || null,
                series: ex.series,
                reps: ex.reps,
                carga: ex.carga || '-',
                pause: ex.pause,
                notes: ex.notes || null,
                coach_instructions: null,
                display_order: idx,
                write_weight: ex.write_weight ?? false,
              })),
            );
          if (insertExError) throw insertExError;
        }
      }

      invalidateAndReload(professorId);
      return { success: true, planId };
    } catch (err) {
      console.error("Error updating training plan:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      // Soft delete - just mark as archived
      const { error: updateError } = await supabase
        .from("training_plans")
        .update({ is_archived: true })
        .eq("id", planId)
        .eq("coach_id", professor?.id); // Ensure coach owns this plan

      if (updateError) throw updateError;

      invalidateAndReload(professorId);

      return { success: true };
    } catch (err) {
      console.error("Error deleting training plan:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  const duplicatePlan = async (planId: string) => {
    if (!professor) {
      return { success: false, error: "No hay usuario autenticado" };
    }

    try {
      // 1. Fetch the complete plan with all days and exercises
      const { data: originalPlan, error: fetchError } = await supabase
        .from("training_plans")
        .select(
          `
          *,
          training_plan_days (
            *,
            training_plan_exercises (*)
          )
        `,
        )
        .eq("id", planId)
        .eq("coach_id", professor.id)
        .single();

      if (fetchError) throw fetchError;
      if (!originalPlan) throw new Error("Plan no encontrado");

      // 2. Create new plan with "Copia de " prefix
      const { data: newPlan, error: planError } = await supabase
        .from("training_plans")
        .insert([
          {
            coach_id: professor.id,
            title: `Copia de ${originalPlan.title}`,
            description: originalPlan.description,
            start_date: originalPlan.start_date,
            end_date: originalPlan.end_date,
            total_days: originalPlan.total_days,
            days_per_week: originalPlan.days_per_week,
            total_weeks: originalPlan.total_weeks,
            plan_type: originalPlan.plan_type,
            difficulty_level: originalPlan.difficulty_level,
            is_template: originalPlan.is_template,
            is_archived: false,
          },
        ])
        .select()
        .single();

      if (planError) throw planError;
      if (!newPlan) throw new Error("No se pudo crear el plan duplicado");

      // 3. Duplicate days
      const days = originalPlan.training_plan_days || [];
      const daysToInsert = days.map((day: any, index: number) => ({
        plan_id: newPlan.id,
        day_number: day.day_number,
        day_name: day.day_name,
        display_order: index,
      }));

      const { data: newDays, error: daysError } = await supabase
        .from("training_plan_days")
        .insert(daysToInsert)
        .select();

      if (daysError) throw daysError;
      if (!newDays) throw new Error("No se pudieron duplicar los días");

      // 4. Create mapping from old day IDs to new day IDs
      const dayIdMap = new Map<string, string>();
      days.forEach((originalDay: any, index: number) => {
        dayIdMap.set(originalDay.id, newDays[index].id);
      });

      // 5. Duplicate exercises
      const allExercises: any[] = [];
      days.forEach((day: any) => {
        const exercises = day.training_plan_exercises || [];
        exercises.forEach((ex: any) => {
          allExercises.push({ ...ex, originalDayId: day.id });
        });
      });

      if (allExercises.length > 0) {
        const exercisesToInsert = allExercises.map((ex) => {
          const newDayId = dayIdMap.get(ex.originalDayId);
          return {
            day_id: newDayId,
            stage_id: ex.stage_id,
            stage_name: ex.stage_name,
            exercise_name: ex.exercise_name,
            video_url: ex.video_url,
            series: ex.series,
            reps: ex.reps,
            carga: ex.carga || '-',
            pause: ex.pause,
            notes: ex.notes,
            coach_instructions: ex.coach_instructions,
            display_order: ex.display_order,
            write_weight: ex.write_weight ?? false,
          };
        });

        const { error: exercisesError } = await supabase
          .from("training_plan_exercises")
          .insert(exercisesToInsert);

        if (exercisesError) throw exercisesError;
      }

      invalidateAndReload(professorId);

      return { success: true, planId: newPlan.id };
    } catch (err) {
      console.error("Error duplicating training plan:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  const assignPlanToStudents = async (
    planId: string,
    studentIds: string[],
    startDate: Date,
    endDate: Date,
  ) => {
    if (!professor) {
      return { success: false, error: "No hay usuario autenticado" };
    }

    try {
      // --- NUEVA VALIDACIÓN: Chequear si ya existen asignaciones ---
      const { data: existingAssignments, error: checkError } = await supabase
        .from("training_plan_assignments")
        .select("student_id")
        .eq("plan_id", planId)
        .in("student_id", studentIds);

      if (checkError) throw checkError;

      // Si encuentra al menos un registro, frenamos todo
      if (existingAssignments && existingAssignments.length > 0) {
        return {
          success: false,
          error: "Uno o más alumnos seleccionados ya tienen este plan asignado."
        };
      }
      // -------------------------------------------------------------

      // Create assignments for each student
      const assignments = studentIds.map((studentId) => ({
        plan_id: planId,
        student_id: studentId,
        coach_id: professor.id,
        start_date: formatLocalDate(startDate),
        end_date: formatLocalDate(endDate),
        status: "active",
        current_day_number: 1,
        completed_days: 0,
      }));

      const { error: assignError } = await supabase
        .from("training_plan_assignments")
        .insert(assignments);

      if (assignError) throw assignError;

      return { success: true };
    } catch (err) {
      console.error("Error assigning plan to students:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  const getAssignedStudents = async (planIdToFetch: string) => {
    console.log("[getAssignedStudents] fetching for planId:", planIdToFetch);
    try {
      // Step 1: fetch assignments only (no JOIN, avoids FK name issues)
      const { data: assignments, error: assignError } = await supabase
        .from("training_plan_assignments")
        .select(
          "id, student_id, start_date, end_date, status, current_day_number, completed_days, created_at",
        )
        .eq("plan_id", planIdToFetch);

      console.log(
        "[getAssignedStudents] assignments:",
        assignments,
        "error:",
        assignError,
      );

      if (assignError) {
        console.error(
          "[getAssignedStudents] DB error:",
          assignError.message,
          assignError.details,
          assignError.hint,
        );
        throw new Error(`Error al leer asignaciones: ${assignError.message}`);
      }

      if (!assignments || assignments.length === 0) {
        console.log("[getAssignedStudents] no assignments found");
        return { success: true, students: [] };
      }

      // Step 2: fetch plan total_days
      const { data: planRow } = await supabase
        .from("training_plans")
        .select("total_days")
        .eq("id", planIdToFetch)
        .single();
      const totalDays = planRow?.total_days || 0;

      // Step 3: fetch profiles separately (avoids FK constraints)
      const studentIds = assignments.map((a) => a.student_id);
      console.log("[getAssignedStudents] fetching profiles for:", studentIds);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, profile_image")
        .in("id", studentIds);

      console.log(
        "[getAssignedStudents] profiles:",
        profiles,
        "error:",
        profilesError,
      );

      if (profilesError) {
        // Non-fatal: show students without profile data
        console.warn(
          "[getAssignedStudents] profiles error (non-fatal):",
          profilesError.message,
        );
      }

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      return {
        success: true,
        students: assignments.map((row) => {
          const profile = profileMap.get(row.student_id);
          return {
            assignmentId: row.id,
            studentId: row.student_id,
            fullName: profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Sin nombre" : "Sin nombre",
            email: profile?.email || "Sin email",
            avatarUrl: profile?.profile_image || null,
            startDate: row.start_date,
            endDate: row.end_date,
            status: row.status || "active",
            currentDay: row.current_day_number || 1,
            completedDays: row.completed_days || 0,
            totalDays,
            assignedAt: row.created_at,
          };
        }),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[getAssignedStudents] caught error:", msg);
      return {
        success: false,
        students: [],
        error: msg,
      };
    }
  };

  const unassignStudent = async (assignmentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("training_plan_assignments")
        .delete()
        .eq("id", assignmentId);

      if (deleteError) throw deleteError;

      invalidateAndReload(professorId); // Refresh counts
      return { success: true };
    } catch (err) {
      console.error("Error unassigning student:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  };

  return {
    plans,
    loading,
    error: null,
    savePlan,
    updatePlan,
    deletePlan,
    duplicatePlan,
    assignPlanToStudents,
    getAssignedStudents,
    unassignStudent,
    reload: () => invalidateAndReload(professorId),
  };
}

// Hook to fetch a single plan with all its days and exercises
export function useTrainingPlanDetail(planId: string | null) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setPlan(null);
      return;
    }

    const fetchPlanDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch plan with days and exercises
        const { data: planData, error: planError } = await supabase
          .from("training_plans")
          .select(
            `
            *,
            training_plan_days (
              *,
              training_plan_exercises (*)
            ),
            training_plan_assignments (count)
          `,
          )
          .eq("id", planId)
          .single();

        if (planError) throw planError;

        setPlan(planData);
      } catch (err) {
        console.error("Error loading plan detail:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetail();
  }, [planId]);

  return { plan, loading, error };
}
