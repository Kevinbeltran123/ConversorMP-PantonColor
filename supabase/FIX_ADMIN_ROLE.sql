-- =====================================================
-- FIX: Asignar rol admin al usuario actual
-- =====================================================
-- Este script asigna el rol 'admin' al usuario que actualmente
-- está autenticado en la sesión de Supabase.
--
-- IMPORTANTE: Ejecuta este script en el SQL Editor de Supabase
-- mientras estás autenticado con tu cuenta.
-- =====================================================

-- Opción 1: Asignar admin al usuario autenticado actualmente
-- (Ejecuta esto en el SQL Editor mientras estás logueado)
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES (auth.uid(), 'admin', auth.uid())
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Opción 2: Si conoces el user_id específico, usa esto:
-- Reemplaza 'TU_USER_ID_AQUI' con el UUID de tu usuario
-- (puedes obtenerlo de la tabla auth.users)
/*
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('TU_USER_ID_AQUI', 'admin', 'TU_USER_ID_AQUI')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
*/

-- Verificar que se aplicó correctamente
SELECT
  ur.user_id,
  ur.role,
  u.email,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id;
