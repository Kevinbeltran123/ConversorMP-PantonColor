-- =====================================================
-- SOLUCIÓN SIMPLE: Permitir lectura de user_roles a usuarios autenticados
-- =====================================================

-- Eliminar todas las políticas de user_roles
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_all_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Política SUPER SIMPLE para SELECT: cualquier usuario autenticado puede leer
CREATE POLICY "authenticated_can_read_user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Para INSERT, UPDATE, DELETE: solo usuarios que ya tienen rol admin
-- Estas usan las funciones SECURITY DEFINER que funcionan
CREATE POLICY "admin_can_insert_user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_can_update_user_roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_can_delete_user_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Verificar
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_roles'
ORDER BY cmd, policyname;
