-- =====================================================
-- OTORGAR PERMISOS a todas las tablas
-- =====================================================

-- products
GRANT SELECT ON public.products TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- colors
GRANT SELECT ON public.colors TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.colors TO authenticated;

-- ingredients
GRANT SELECT ON public.ingredients TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.ingredients TO authenticated;

-- formulas
GRANT SELECT ON public.formulas TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.formulas TO authenticated;

-- formula_items
GRANT SELECT ON public.formula_items TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.formula_items TO authenticated;

-- batches
GRANT SELECT ON public.batches TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.batches TO authenticated;

-- batch_items
GRANT SELECT ON public.batch_items TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.batch_items TO authenticated;

-- audit_logs
GRANT SELECT ON public.audit_logs TO authenticated, anon;
GRANT INSERT ON public.audit_logs TO authenticated;

-- Verificar todos los permisos
SELECT
  table_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee, privilege_type;
