-- =====================================================
-- RESET DATABASE (CUIDADO: Borra TODOS los datos)
-- Solo usar si quieres empezar desde cero
-- =====================================================

-- Borrar schema public y recrearlo
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Restaurar permisos
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Ahora puedes ejecutar las migraciones de nuevo en orden:
-- 1. 20260126_initial_schema.sql
-- 2. 20260126_rls_policies.sql
-- 3. 20260126_triggers_functions.sql
-- 4. 20260126_seeds.sql
