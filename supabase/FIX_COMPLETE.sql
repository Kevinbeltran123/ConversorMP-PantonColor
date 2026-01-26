-- =====================================================
-- SOLUCIÓN COMPLETA: Limpiar y desactivar RLS en user_roles
-- =====================================================

-- 1. Eliminar TODAS las políticas existentes
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END $$;

-- 2. Desactivar RLS
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 3. Verificar que no hay políticas
SELECT
  COUNT(*) as num_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_roles';

-- 4. Verificar que RLS está desactivado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'user_roles';

-- 5. Probar lectura
SELECT * FROM public.user_roles;
