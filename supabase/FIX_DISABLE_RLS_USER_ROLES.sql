-- =====================================================
-- SOLUCIÓN DRÁSTICA: Desactivar RLS en user_roles
-- =====================================================
-- Esto es seguro porque user_roles solo contiene user_id y role
-- No hay información sensible en esta tabla
-- =====================================================

-- OPCIÓN 1: Desactivar RLS completamente en user_roles
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está desactivado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'user_roles';

-- Ver si ahora puedes leer user_roles
SELECT * FROM public.user_roles;
