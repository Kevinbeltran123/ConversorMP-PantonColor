-- =====================================================
-- SOLUCIÓN FINAL: Políticas RLS sin recursión infinita
-- =====================================================
-- Estrategia: Crear una función con SECURITY DEFINER
-- que hace BYPASS de RLS para verificar roles
-- =====================================================

-- 1. Eliminar políticas con recursión
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_policy" ON public.user_roles;

-- 2. Recrear funciones helper con SECURITY DEFINER para bypass RLS
-- Estas funciones NO están sujetas a RLS porque usan SECURITY DEFINER
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_operator();
DROP FUNCTION IF EXISTS public.has_role();
DROP FUNCTION IF EXISTS public.get_user_role();

-- Función para obtener el rol del usuario actual (con bypass RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS VARCHAR AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es admin (con bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();

  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es operator (con bypass RLS)
CREATE OR REPLACE FUNCTION public.is_operator()
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();

  RETURN user_role = 'operator';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario tiene un rol asignado (con bypass RLS)
CREATE OR REPLACE FUNCTION public.has_role()
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid();

  RETURN user_role IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear políticas SIMPLES para user_roles
-- Estas políticas ahora SÍ pueden usar las funciones helper porque
-- las funciones hacen BYPASS de RLS (SECURITY DEFINER)

-- SELECT: Usuarios ven solo su propio rol
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- SELECT: Admins pueden ver todos los roles
CREATE POLICY "user_roles_select_all_admin"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

-- INSERT: Solo admins pueden insertar roles
CREATE POLICY "user_roles_insert_admin"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE: Solo admins pueden actualizar roles
CREATE POLICY "user_roles_update_admin"
  ON public.user_roles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: Solo admins pueden eliminar roles
CREATE POLICY "user_roles_delete_admin"
  ON public.user_roles FOR DELETE
  USING (public.is_admin());

-- 4. Verificar que las políticas se crearon correctamente
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_roles'
ORDER BY cmd, policyname;
