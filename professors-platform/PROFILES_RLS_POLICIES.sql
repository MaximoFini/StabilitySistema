-- ========================================
-- RLS Policies for Profiles and Student Profiles
-- Execute this in Supabase SQL Editor
-- ========================================

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on student_profiles table (if not already enabled)
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES TABLE POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can view all student profiles" ON profiles;
DROP POLICY IF EXISTS "All authenticated users can view student profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: All authenticated users can view student profiles (simplified to avoid recursion)
-- This allows coaches and students to see each other's basic info
CREATE POLICY "All authenticated users can view student profiles"
ON profiles FOR SELECT
TO authenticated
USING (role = 'student');

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ========================================
-- STUDENT_PROFILES TABLE POLICIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own profile" ON student_profiles;
DROP POLICY IF EXISTS "Coaches can view all student profiles" ON student_profiles;
DROP POLICY IF EXISTS "All authenticated users can view student profiles" ON student_profiles;
DROP POLICY IF EXISTS "Students can update their own profile" ON student_profiles;

-- Policy 1: Students can view their own profile
CREATE POLICY "Students can view their own profile"
ON student_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: All authenticated users can view all student profiles (simplified)
-- This allows coaches to see all student details
CREATE POLICY "All authenticated users can view student profiles"
ON student_profiles FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Students can update their own profile
CREATE POLICY "Students can update their own profile"
ON student_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'student_profiles')
ORDER BY tablename, policyname;
