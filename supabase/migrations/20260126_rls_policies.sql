-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Sistema ConversorMP - Graniplast
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Función para verificar si el usuario es operator
CREATE OR REPLACE FUNCTION public.is_operator()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'operator'
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Función para verificar si el usuario tiene un rol asignado
CREATE OR REPLACE FUNCTION public.has_role()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formula_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: USER_ROLES
-- =====================================================
-- Solo admins pueden gestionar roles
-- Todos pueden ver su propio rol

CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLICIES: PRODUCTS
-- =====================================================
-- Admin: CRUD completo
-- Operator: Solo lectura

CREATE POLICY "Users with role can view products"
  ON public.products FOR SELECT
  USING (public.has_role());

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLICIES: COLORS
-- =====================================================
-- Admin: CRUD completo
-- Operator: Solo lectura

CREATE POLICY "Users with role can view colors"
  ON public.colors FOR SELECT
  USING (public.has_role());

CREATE POLICY "Admins can insert colors"
  ON public.colors FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update colors"
  ON public.colors FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete colors"
  ON public.colors FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLICIES: INGREDIENTS
-- =====================================================
-- Admin: CRUD completo
-- Operator: Solo lectura

CREATE POLICY "Users with role can view ingredients"
  ON public.ingredients FOR SELECT
  USING (public.has_role());

CREATE POLICY "Admins can insert ingredients"
  ON public.ingredients FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update ingredients"
  ON public.ingredients FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete ingredients"
  ON public.ingredients FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLICIES: FORMULAS
-- =====================================================
-- Admin: CRUD completo
-- Operator: Solo lectura

CREATE POLICY "Users with role can view formulas"
  ON public.formulas FOR SELECT
  USING (public.has_role());

CREATE POLICY "Admins can insert formulas"
  ON public.formulas FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update formulas"
  ON public.formulas FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete formulas"
  ON public.formulas FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLICIES: FORMULA_ITEMS
-- =====================================================
-- Admin: CRUD completo
-- Operator: Solo lectura

CREATE POLICY "Users with role can view formula items"
  ON public.formula_items FOR SELECT
  USING (public.has_role());

CREATE POLICY "Admins can insert formula items"
  ON public.formula_items FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update formula items"
  ON public.formula_items FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete formula items"
  ON public.formula_items FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLICIES: BATCHES
-- =====================================================
-- Admin: CRUD completo
-- Operator: Puede crear y leer (para calcular/guardar lotes)

CREATE POLICY "Users with role can view batches"
  ON public.batches FOR SELECT
  USING (public.has_role());

CREATE POLICY "Users with role can insert batches"
  ON public.batches FOR INSERT
  WITH CHECK (public.has_role());

CREATE POLICY "Admins can update batches"
  ON public.batches FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete batches"
  ON public.batches FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLICIES: BATCH_ITEMS
-- =====================================================
-- Admin: CRUD completo
-- Operator: Puede crear y leer (snapshot de lotes)

CREATE POLICY "Users with role can view batch items"
  ON public.batch_items FOR SELECT
  USING (public.has_role());

CREATE POLICY "Users with role can insert batch items"
  ON public.batch_items FOR INSERT
  WITH CHECK (public.has_role());

CREATE POLICY "Admins can update batch items"
  ON public.batch_items FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete batch items"
  ON public.batch_items FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLICIES: AUDIT_LOGS
-- =====================================================
-- Solo lectura para todos con rol
-- Inserción vía triggers (SECURITY DEFINER)

CREATE POLICY "Users with role can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role());

-- =====================================================
-- GRANT PERMISSIONS: user_roles
-- =====================================================
-- IMPORTANTE: user_roles necesita permisos GRANT porque
-- las funciones helper (is_admin, has_role, etc.) la consultan
-- y Supabase usa los roles 'authenticated' y 'anon' para conexiones

-- Desactivar RLS en user_roles para evitar recursión infinita
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos de lectura
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;

-- Otorgar permisos de escritura solo a authenticated
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- =====================================================
-- GRANT PERMISSIONS: Todas las demás tablas
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

-- audit_logs (solo lectura para usuarios, inserción vía triggers)
GRANT SELECT ON public.audit_logs TO authenticated, anon;
GRANT INSERT ON public.audit_logs TO authenticated;
