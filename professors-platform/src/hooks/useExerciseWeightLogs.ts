import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface SetDetail {
  set_number: number;
  target_reps: string;
  actual_reps: string | null;
  kg: number | null;
}

export interface ExerciseWeightLog {
  id: string;
  exercise_name: string;
  plan_day_number: number;
  plan_day_name: string;
  series: number;
  sets_detail: SetDetail[];
  logged_at: string;
  calculated_rm?: number | null;
  rm_kg?: number | null;
  rm_note_id?: string | null;
}

export interface ExerciseGroup {
  exercise_name: string;
  logs: ExerciseWeightLog[];
}

export interface ExerciseRmNote {
  id: string;
  rm_kg: number | null;
}

export function useExerciseWeightLogs(studentId: string | undefined) {
  const [groups, setGroups] = useState<ExerciseGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("exercise_weight_logs")
        .select(
          `
          id,
          exercise_name,
          plan_day_number,
          plan_day_name,
          series,
          sets_detail,
          logged_at,
          exercise_rm_notes (
            id,
            rm_kg
          )
        `,
        )
        .eq("student_id", studentId)
        .order("logged_at", { ascending: false });

      if (error || !data) {
        console.error("Error loading exercise weight logs:", error);
        setLoading(false);
        return;
      }

      // Función para calcular el RM usando la fórmula de Epley: 1RM = Peso × (1 + Reps/30)
      const calculateRm = (setsDetail: SetDetail[]): number | null => {
        const validSets = setsDetail.filter(
          (s) => s.kg != null && s.actual_reps != null && s.kg > 0,
        );

        if (validSets.length === 0) return null;

        const rmSum = validSets.reduce((sum, s) => {
          const reps = parseFloat(s.actual_reps!);
          const weight = s.kg!;
          const oneRm = weight * (1 + reps / 30);
          return sum + oneRm;
        }, 0);

        const avgRm = rmSum / validSets.length;
        return Math.round(avgRm * 100) / 100; // Redondear a 2 decimales
      };

      // Agrupar por nombre de ejercicio
      const groupMap = new Map<string, ExerciseWeightLog[]>();
      for (const row of data) {
        const rmNotes = (row.exercise_rm_notes as ExerciseRmNote[]) || [];
        const rmNote = rmNotes[0];
        const setsDetail = row.sets_detail as SetDetail[];

        const log: ExerciseWeightLog = {
          id: row.id,
          exercise_name: row.exercise_name,
          plan_day_number: row.plan_day_number,
          plan_day_name: row.plan_day_name,
          series: row.series,
          sets_detail: setsDetail,
          logged_at: row.logged_at,
          calculated_rm: calculateRm(setsDetail),
          rm_kg: rmNote?.rm_kg ?? null,
          rm_note_id: rmNote?.id ?? null,
        };
        if (!groupMap.has(row.exercise_name)) {
          groupMap.set(row.exercise_name, []);
        }
        groupMap.get(row.exercise_name)!.push(log);
      }

      // Ordenar los logs dentro de cada grupo por fecha ascendente (más antiguos primero)
      const sortedGroups = Array.from(groupMap.entries())
        .map(([name, logs]) => ({
          exercise_name: name,
          logs: logs.sort(
            (a, b) =>
              new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime(),
          ),
        }))
        .sort((a, b) => a.exercise_name.localeCompare(b.exercise_name));

      setGroups(sortedGroups);
      setLoading(false);
    };

    load();
  }, [studentId]);

  return { groups, loading };
}
