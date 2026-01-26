-- =====================================================
-- OTORGAR PERMISOS a roles de Supabase
-- =====================================================

-- Otorgar permisos de lectura a usuarios autenticados y anónimos
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;

-- Otorgar permisos de escritura solo a authenticated (para que los admins puedan gestionar roles)
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Verificar que se otorgaron los permisos
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'user_roles'
ORDER BY grantee, privilege_type;
