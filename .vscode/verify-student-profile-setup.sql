-- Script de verificación para asegurar que todo esté configurado correctamente
-- Ejecutar DESPUÉS de aplicar fix-student-profile-permissions.sql

-- ============================================
-- 1. VERIFICAR ESTRUCTURA DE LA TABLA
-- ============================================
SELECT 'ESTRUCTURA DE student_profiles:' as check_type;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'student_profiles'
ORDER BY ordinal_position;

-- ============================================
-- 2. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ============================================
SELECT 'VERIFICAR RLS:' as check_type;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'student_profiles';

-- ============================================  
-- 3. VERIFICAR POLÍTICAS DE RLS
-- ============================================
SELECT 'POLÍTICAS DE RLS:' as check_type;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE tablename = 'student_profiles';

-- ============================================
-- 4. VERIFICAR BUCKET DE STORAGE
-- ============================================
SELECT 'BUCKETS DE STORAGE:' as check_type;
SELECT 
    id,
    name,
    public
FROM storage.buckets
WHERE name = 'profile-images';

-- ============================================
-- 5. VERIFICAR POLÍTICAS DE STORAGE
-- ============================================
SELECT 'POLÍTICAS DE STORAGE:' as check_type;
SELECT
    id,
    name,
    definition
FROM storage.policies
WHERE bucket_id = 'profile-images';

-- ============================================
-- 6. CONTAR REGISTROS ACTUALES
-- ============================================
SELECT 'REGISTROS EN student_profiles:' as check_type;
SELECT COUNT(*) as total_students
FROM student_profiles;

-- ============================================
-- 7. VERIFICAR PERFILES SIN STUDENT_PROFILE
-- ============================================
SELECT 'ESTUDIANTES SIN PERFIL COMPLETO:' as check_type;
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.role,
    CASE 
        WHEN sp.id IS NULL THEN 'NO'
        ELSE 'SI'
    END as has_student_profile
FROM profiles p
LEFT JOIN student_profiles sp ON p.id = sp.id
WHERE p.role = 'student'
ORDER BY p.created_at DESC;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ student_profiles debe tener RLS habilitado (rls_enabled = true)
-- ✅ Debe haber 3 políticas de RLS: INSERT, SELECT, UPDATE
-- ✅ El bucket 'profile-images' debe existir y ser público (public = true)
-- ✅ Debe haber al menos 2 políticas de storage para el bucket
