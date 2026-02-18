import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../features/auth/store/authStore';
import type { PlanExercise } from '../lib/types';
import type { Professor } from '../features/auth/store/authStore';

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

export function useTrainingPlans() {
  const [plans, setPlans] = useState<TrainingPlanSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const professor = useAuthStore((state: AuthState) => state.professor);

  const loadPlans = useCallback(async () => {
    if (!professor) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch plans with assignment counts
      const { data: plansData, error: fetchError } = await supabase
        .from('training_plans')
        .select(`
          *,
          training_plan_assignments(count)
        `)
        .eq('coach_id', professor.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform the data to include assignedCount
      interface PlanWithAssignments extends Omit<TrainingPlanSummary, 'assignedCount'> {
        training_plan_assignments?: Array<{ count: number }>;
      }
      
      const transformedPlans: TrainingPlanSummary[] = (plansData || []).map((plan: PlanWithAssignments) => ({
        ...plan,
        assignedCount: plan.training_plan_assignments?.[0]?.count || 0,
      }));

      setPlans(transformedPlans);
    } catch (err) {
      console.error('Error loading training plans:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [professor]);

  useEffect(() => {
    if (professor) {
      loadPlans();
    }
  }, [professor, loadPlans]);

  const savePlan = async (planData: SavePlanData) => {
    if (!professor) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    try {
      // Calculate plan metadata
      const totalDays = planData.days.length;
      const msPerDay = 24 * 60 * 60 * 1000;
      const totalDaysInPeriod = Math.ceil(
        (planData.endDate.getTime() - planData.startDate.getTime()) / msPerDay
      ) + 1;
      const totalWeeks = Math.ceil(totalDaysInPeriod / 7);
      const daysPerWeek = Math.ceil(totalDays / totalWeeks);

      // 1. Insert the main training plan
      const { data: insertedPlan, error: planError } = await supabase
        .from('training_plans')
        .insert([{
          coach_id: professor.id,
          title: planData.title,
          description: planData.description || null,
          start_date: planData.startDate.toISOString().split('T')[0],
          end_date: planData.endDate.toISOString().split('T')[0],
          total_days: totalDays,
          days_per_week: daysPerWeek,
          total_weeks: totalWeeks,
          plan_type: planData.isTemplate ? 'template' : 'custom',
          difficulty_level: null,
          is_template: planData.isTemplate,
          is_archived: false,
        }])
        .select()
        .single();

      if (planError) throw planError;
      if (!insertedPlan) throw new Error('No se pudo crear el plan');

      // 2. Insert training plan days
      const daysToInsert = planData.days.map((day, index) => ({
        plan_id: insertedPlan.id,
        day_number: day.number,
        day_name: day.name,
        display_order: index,
      }));

      const { data: insertedDays, error: daysError } = await supabase
        .from('training_plan_days')
        .insert(daysToInsert)
        .select();

      if (daysError) throw daysError;
      if (!insertedDays) throw new Error('No se pudieron crear los días');

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
            video_url: null,
            series: ex.series,
            reps: ex.reps,
            intensity: ex.intensity,
            pause: ex.pause,
            notes: ex.notes || null,
            coach_instructions: null,
            display_order: index,
          };
        })
        .filter((ex) => ex !== null);

      if (exercisesToInsert.length > 0) {
        const { error: exercisesError } = await supabase
          .from('training_plan_exercises')
          .insert(exercisesToInsert);

        if (exercisesError) throw exercisesError;
      }

      // Reload plans to get updated list
      await loadPlans();

      return { success: true, planId: insertedPlan.id };
    } catch (err) {
      console.error('Error saving training plan:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      };
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      // Soft delete - just mark as archived
      const { error: updateError } = await supabase
        .from('training_plans')
        .update({ is_archived: true })
        .eq('id', planId)
        .eq('coach_id', professor?.id); // Ensure coach owns this plan

      if (updateError) throw updateError;

      // Reload plans
      await loadPlans();

      return { success: true };
    } catch (err) {
      console.error('Error deleting training plan:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      };
    }
  };

  return {
    plans,
    loading,
    error,
    savePlan,
    deletePlan,
    reload: loadPlans,
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
          .from('training_plans')
          .select(`
            *,
            training_plan_days (
              *,
              training_plan_exercises (*)
            )
          `)
          .eq('id', planId)
          .single();

        if (planError) throw planError;

        setPlan(planData);
      } catch (err) {
        console.error('Error loading plan detail:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetail();
  }, [planId]);

  return { plan, loading, error };
}
