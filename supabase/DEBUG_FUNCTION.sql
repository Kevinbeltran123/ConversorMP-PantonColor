-- =====================================================
-- FUNCIÓN DE DEBUG: Verificar auth.uid()
-- =====================================================
-- Esta función temporal nos permite verificar qué usuario
-- ve PostgreSQL cuando hacemos requests desde Next.js
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_auth_uid()
RETURNS UUID AS $$
  SELECT auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO anon;
