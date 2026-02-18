import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../features/auth/store/authStore';

export interface Student {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  trainingLevel: string; // beginner, intermediate, advanced
  primaryGoal: string; // aesthetic, sports, health, rehabilitation
  activityLevel: string;
  phone?: string;
  instagram?: string;
}

interface AuthState {
  professor: { id: string } | null;
}

interface ProfileRow {
  id: string;
  first_name: string;
  last_name: string;
}

interface StudentDetailRow {
  id: string;
  profile_image_url: string | null;
  training_experience: string;
  primary_goal: string;
  activity_level: string;
  phone: string | null;
  instagram: string | null;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const professor = useAuthStore((state: AuthState) => state.professor);

  const loadStudents = useCallback(async () => {
    if (!professor) {
      console.log('🔴 useStudents: No professor in state');
      return;
    }

    console.log('🟢 useStudents: Loading students for professor:', professor.id);

    try {
      setLoading(true);
      setError(null);

      // Fetch students from profiles table (role = 'student')
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      console.log('📊 Profiles query result:', { 
        count: profilesData?.length || 0, 
        error: profilesError,
        data: profilesData 
      });

      if (profilesError) throw profilesError;
      if (!profilesData || profilesData.length === 0) {
        console.log('⚠️ No student profiles found');
        setStudents([]);
        return;
      }

      // Get all student IDs
      const studentIds = (profilesData as ProfileRow[]).map((p: ProfileRow) => p.id);
      console.log('🔑 Student IDs:', studentIds);

      // Fetch detailed student profiles
      const { data: studentDetails, error: detailsError } = await supabase
        .from('student_profiles')
        .select('id, profile_image_url, training_experience, primary_goal, activity_level, phone, instagram')
        .in('id', studentIds);

      console.log('📋 Student profiles query result:', { 
        count: studentDetails?.length || 0, 
        error: detailsError,
        data: studentDetails 
      });

      if (detailsError) throw detailsError;

      // Create a map for quick lookup
      const detailsMap = new Map((studentDetails as StudentDetailRow[] || []).map((d: StudentDetailRow) => [d.id, d]));

      // Combine data
      const transformedStudents: Student[] = (profilesData as ProfileRow[])
        .filter((profile: ProfileRow) => detailsMap.has(profile.id)) // Only include students with profiles
        .map((profile: ProfileRow) => {
          const details = detailsMap.get(profile.id);
          return {
            id: profile.id,
            fullName: `${profile.first_name} ${profile.last_name}`,
            profileImageUrl: details?.profile_image_url || null,
            trainingLevel: details?.training_experience || 'beginner',
            primaryGoal: details?.primary_goal || 'health',
            activityLevel: details?.activity_level || 'moderate',
            phone: details?.phone || undefined,
            instagram: details?.instagram || undefined,
          };
        });

      console.log('✅ Final transformed students:', transformedStudents);
      setStudents(transformedStudents);
    } catch (err) {
      console.error('❌ Error loading students:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [professor]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return {
    students,
    loading,
    error,
    reload: loadStudents,
  };
}

// Helper function to map training experience level to display text
export const getTrainingLevelDisplay = (level: string): string => {
  const levels: Record<string, string> = {
    'none': 'Sin experiencia',
    'beginner': 'Principiante',
    'intermediate': 'Intermedio',
    'advanced': 'Avanzado',
  };
  return levels[level] || 'Sin especificar';
};

// Helper function to map primary goal to display text
export const getPrimaryGoalDisplay = (goal: string): string => {
  const goals: Record<string, string> = {
    'aesthetic': 'Estética',
    'sports': 'Deporte',
    'health': 'Salud',
    'rehabilitation': 'Rehabilitación',
  };
  return goals[goal] || 'Sin especificar';
};

// Helper function to map activity level to display text
export const getActivityLevelDisplay = (level: string): string => {
  const levels: Record<string, string> = {
    'sedentary': 'Sedentario',
    'light': 'Ligero',
    'moderate': 'Moderado',
    'active': 'Activo',
    'very_active': 'Muy activo',
  };
  return levels[level] || 'Sin especificar';
};

// Get a meaningful tag combining level + goal
export const getStudentTag = (trainingLevel: string, primaryGoal: string): string => {
  const levelShort = getTrainingLevelDisplay(trainingLevel)?.split(' ')[0] || 'Nivel';
  const goalDisplay = getPrimaryGoalDisplay(primaryGoal) || 'Objetivo';
  return `${levelShort} • ${goalDisplay}`;
};
