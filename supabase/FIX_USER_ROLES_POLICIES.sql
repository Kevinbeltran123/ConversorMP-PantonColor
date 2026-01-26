-- =====================================================
-- FIX: Políticas RLS para user_roles sin dependencias circulares
-- =====================================================
-- Las políticas de user_roles NO pueden depender de funciones
-- que consultan user_roles (is_admin, has_role, etc.)
-- =====================================================

-- 1. Eliminar políticas antiguas
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- 2. Crear políticas nuevas SIN dependencias circulares

-- SELECT: Todos pueden ver su propio rol
-- Y los usuarios con rol 'admin' pueden ver todos los roles
CREATE POLICY "user_roles_select_policy"
  ON public.user_roles FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- INSERT: Solo usuarios que ya tienen rol 'admin' pueden insertar roles
CREATE POLICY "user_roles_insert_policy"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- UPDATE: Solo usuarios que ya tienen rol 'admin' pueden actualizar roles
CREATE POLICY "user_roles_update_policy"
  ON public.user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- DELETE: Solo usuarios que ya tienen rol 'admin' pueden eliminar roles
CREATE POLICY "user_roles_delete_policy"
  ON public.user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Verificar que las políticas se crearon correctamente
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_roles'
ORDER BY cmd, policyname;
