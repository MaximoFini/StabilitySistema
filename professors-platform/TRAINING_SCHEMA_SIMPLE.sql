-- Training Plans Database Schema - SIMPLIFIED VERSION
-- Execute this SQL first to test table creation

-- Drop existing tables if they exist
DROP TABLE IF EXISTS training_plan_assignments CASCADE;
DROP TABLE IF EXISTS training_plan_exercises CASCADE;
DROP TABLE IF EXISTS training_plan_days CASCADE;
DROP TABLE IF EXISTS training_plans CASCADE;
DROP TABLE IF EXISTS exercise_stages CASCADE;

-- 1. Exercise Stages Table
CREATE TABLE exercise_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    display_order INTEGER NOT NULL,
    coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Training Plans Table
CREATE TABLE training_plans (
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
CREATE TABLE training_plan_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Training Plan Exercises Table
CREATE TABLE training_plan_exercises (
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
CREATE TABLE training_plan_assignments (
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

-- Create Indexes
CREATE INDEX idx_training_plans_coach ON training_plans(coach_id);
CREATE INDEX idx_training_plans_archived ON training_plans(is_archived);
CREATE INDEX idx_training_plan_days_plan ON training_plan_days(plan_id);
CREATE INDEX idx_training_plan_exercises_day ON training_plan_exercises(day_id);
CREATE INDEX idx_training_plan_assignments_plan ON training_plan_assignments(plan_id);
CREATE INDEX idx_training_plan_assignments_student ON training_plan_assignments(student_id);
CREATE INDEX idx_training_plan_assignments_coach ON training_plan_assignments(coach_id);
CREATE INDEX idx_exercise_stages_coach ON exercise_stages(coach_id);

-- Simple message
SELECT 'Tables created successfully!' as result;
