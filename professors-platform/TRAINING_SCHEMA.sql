-- Training Plans Database Schema
-- Execute this SQL in Supabase SQL Editor to create all required tables

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS training_plan_assignments CASCADE;
DROP TABLE IF EXISTS training_plan_exercises CASCADE;
DROP TABLE IF EXISTS training_plan_days CASCADE;
DROP TABLE IF EXISTS training_plans CASCADE;
DROP TABLE IF EXISTS exercise_stages CASCADE;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Coaches can view all exercise stages" ON exercise_stages;
DROP POLICY IF EXISTS "Coaches can create exercise stages" ON exercise_stages;
DROP POLICY IF EXISTS "Coaches can update exercise stages" ON exercise_stages;
DROP POLICY IF EXISTS "Coaches can delete exercise stages" ON exercise_stages;
DROP POLICY IF EXISTS "Coaches can view their own plans" ON training_plans;
DROP POLICY IF EXISTS "Students can view assigned plans" ON training_plans;
DROP POLICY IF EXISTS "Coaches can create plans" ON training_plans;
DROP POLICY IF EXISTS "Coaches can update their own plans" ON training_plans;
DROP POLICY IF EXISTS "Coaches can delete their own plans" ON training_plans;
DROP POLICY IF EXISTS "Users can view days of accessible plans" ON training_plan_days;
DROP POLICY IF EXISTS "Coaches can manage days of their plans" ON training_plan_days;
DROP POLICY IF EXISTS "Users can view exercises of accessible days" ON training_plan_exercises;
DROP POLICY IF EXISTS "Coaches can manage exercises of their plans" ON training_plan_exercises;
DROP POLICY IF EXISTS "Coaches can view their assignments" ON training_plan_assignments;
DROP POLICY IF EXISTS "Students can view their assignments" ON training_plan_assignments;
DROP POLICY IF EXISTS "Coaches can create assignments" ON training_plan_assignments;
DROP POLICY IF EXISTS "Coaches can update their assignments" ON training_plan_assignments;
DROP POLICY IF EXISTS "Coaches can delete their assignments" ON training_plan_assignments;

-- 1. Exercise Stages Table (shared between all coaches)
CREATE TABLE IF NOT EXISTS exercise_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Training Plans Table
CREATE TABLE IF NOT EXISTS training_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    days_per_week INTEGER NOT NULL,
    total_weeks INTEGER NOT NULL,
    plan_type TEXT,
    difficulty_level TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Training Plan Days Table
CREATE TABLE IF NOT EXISTS training_plan_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Training Plan Exercises Table
CREATE TABLE IF NOT EXISTS training_plan_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID NOT NULL REFERENCES training_plan_days(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES exercise_stages(id) ON DELETE SET NULL,
    stage_name TEXT NOT NULL,
    exercise_name TEXT NOT NULL,
    video_url TEXT,
    series INTEGER NOT NULL,
    reps TEXT NOT NULL,
    intensity INTEGER NOT NULL,
    pause TEXT NOT NULL,
    notes TEXT,
    coach_instructions TEXT,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Training Plan Assignments Table
CREATE TABLE IF NOT EXISTS training_plan_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    current_day_number INTEGER DEFAULT 1,
    completed_days INTEGER DEFAULT 0,
    personalization_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_training_plans_coach ON training_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_training_plans_archived ON training_plans(is_archived);
CREATE INDEX IF NOT EXISTS idx_training_plan_days_plan ON training_plan_days(plan_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_exercises_day ON training_plan_exercises(day_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_assignments_plan ON training_plan_assignments(plan_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_assignments_student ON training_plan_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_assignments_coach ON training_plan_assignments(coach_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE exercise_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plan_assignments ENABLE ROW LEVEL SECURITY;

-- Exercise Stages Policies (shared between all coaches)
CREATE POLICY "Coaches can view all exercise stages"
    ON exercise_stages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'coach'
        )
    );

CREATE POLICY "Coaches can create exercise stages"
    ON exercise_stages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'coach'
        )
    );

CREATE POLICY "Coaches can update exercise stages"
    ON exercise_stages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'coach'
        )
    );

CREATE POLICY "Coaches can delete exercise stages"
    ON exercise_stages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'coach'
        )
    );

-- Training Plans Policies
CREATE POLICY "Coaches can view their own plans"
    ON training_plans FOR SELECT
    USING (auth.uid() = coach_id);

CREATE POLICY "Students can view assigned plans"
    ON training_plans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM training_plan_assignments
            WHERE training_plan_assignments.plan_id = training_plans.id
            AND training_plan_assignments.student_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can create plans"
    ON training_plans FOR INSERT
    WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own plans"
    ON training_plans FOR UPDATE
    USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own plans"
    ON training_plans FOR DELETE
    USING (auth.uid() = coach_id);

-- Training Plan Days Policies
CREATE POLICY "Users can view days of accessible plans"
    ON training_plan_days FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM training_plans
            WHERE training_plans.id = training_plan_days.plan_id
            AND (
                training_plans.coach_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM training_plan_assignments
                    WHERE training_plan_assignments.plan_id = training_plans.id
                    AND training_plan_assignments.student_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Coaches can manage days of their plans"
    ON training_plan_days FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM training_plans
            WHERE training_plans.id = training_plan_days.plan_id
            AND training_plans.coach_id = auth.uid()
        )
    );

-- Training Plan Exercises Policies
CREATE POLICY "Users can view exercises of accessible days"
    ON training_plan_exercises FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM training_plan_days
            JOIN training_plans ON training_plans.id = training_plan_days.plan_id
            WHERE training_plan_days.id = training_plan_exercises.day_id
            AND (
                training_plans.coach_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM training_plan_assignments
                    WHERE training_plan_assignments.plan_id = training_plans.id
                    AND training_plan_assignments.student_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Coaches can manage exercises of their plans"
    ON training_plan_exercises FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM training_plan_days
            JOIN training_plans ON training_plans.id = training_plan_days.plan_id
            WHERE training_plan_days.id = training_plan_exercises.day_id
            AND training_plans.coach_id = auth.uid()
        )
    );

-- Training Plan Assignments Policies
CREATE POLICY "Coaches can view their assignments"
    ON training_plan_assignments FOR SELECT
    USING (auth.uid() = coach_id);

CREATE POLICY "Students can view their assignments"
    ON training_plan_assignments FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Coaches can create assignments"
    ON training_plan_assignments FOR INSERT
    WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their assignments"
    ON training_plan_assignments FOR UPDATE
    USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their assignments"
    ON training_plan_assignments FOR DELETE
    USING (auth.uid() = coach_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exercise_stages_updated_at
    BEFORE UPDATE ON exercise_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at
    BEFORE UPDATE ON training_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plan_assignments_updated_at
    BEFORE UPDATE ON training_plan_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
