-- Script rápido para verificar configuración de Supabase
-- Ejecuta esto ANTES de intentar registrarte nuevamente

-- ============================================
-- 1. VERIFICAR BUCKET profile-images
-- ============================================
SELECT 'VERIFICAR BUCKET:' as check_type;
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets
WHERE name = 'profile-images';

-- RESULTADO ESPERADO:
-- Si NO aparece nada, el bucket NO EXISTE (debes crearlo)
-- Si aparece, verifica que public = true

-- ============================================
-- 2. VERIFICAR TABLA student_profiles
-- ============================================
SELECT 'VERIFICAR TABLA:' as check_type;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'student_profiles'
) as table_exists;

-- ============================================
-- 3. VERIFICAR RLS EN student_profiles
-- ============================================
SELECT 'VERIFICAR RLS:' as check_type;
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'student_profiles';

-- RESULTADO ESPERADO: rls_enabled = true

-- ============================================
-- 4. VERIFICAR POLÍTICAS DE RLS
-- ============================================
SELECT 'POLÍTICAS RLS:' as check_type;
SELECT 
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'student_profiles';

-- RESULTADO ESPERADO: 
-- Debe haber al menos 3 políticas: INSERT, SELECT, UPDATE

-- ============================================
-- 5. VERIFICAR COLUMNAS DE student_profiles
-- ============================================
SELECT 'COLUMNAS DE TABLA:' as check_type;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'student_profiles'
ORDER BY ordinal_position;

-- ============================================
-- INSTRUCCIONES
-- ============================================
-- Si alguna de estas verificaciones falla:
-- 1. El bucket no existe -> Créalo en Storage
-- 2. RLS no está habilitado -> Ejecuta fix-student-profile-permissions.sql
-- 3. Faltan políticas -> Ejecuta fix-student-profile-permissions.sql
