-- Migration: Convert exercise_stages from coach-owned to shared between all coaches
-- This script safely migrates existing data

-- Step 1: Drop existing policies that use coach_id
DROP POLICY IF EXISTS "Users can view their own exercise stages" ON exercise_stages;
DROP POLICY IF EXISTS "Users can create their own exercise stages" ON exercise_stages;
DROP POLICY IF EXISTS "Users can update their own exercise stages" ON exercise_stages;
DROP POLICY IF EXISTS "Users can delete their own exercise stages" ON exercise_stages;

-- Step 2: Drop the index on coach_id
DROP INDEX IF EXISTS idx_exercise_stages_coach;

-- Step 3: Remove the coach_id column
-- Note: This will consolidate all stages from all coaches into a shared collection
-- If you have duplicate stage names from different coaches, you may want to rename them first
ALTER TABLE exercise_stages DROP COLUMN IF EXISTS coach_id;

-- Step 4: Create new policies for shared access (all coaches can access all stages)
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

-- Step 5: Verification query
-- Run this to see all exercise stages (should now be visible to all coaches)
SELECT 
    id,
    name,
    color,
    display_order,
    created_at
FROM exercise_stages
ORDER BY display_order;

-- Migration complete!
-- All exercise stages are now shared between all coaches.
