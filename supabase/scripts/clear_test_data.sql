-- =====================================================
-- SCRIPT: Eliminar todos los datos de prueba
-- IMPORTANTE: Este script elimina TODOS los datos de las tablas
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

-- Desactivar temporalmente los triggers de auditoría (si existen)
-- para evitar registros innecesarios durante la limpieza
SET session_replication_role = 'replica';

-- =====================================================
-- PASO 1: Eliminar datos en orden (respetando foreign keys)
-- =====================================================

-- 1. Eliminar items de lotes (depende de batches)
DELETE FROM batch_items;

-- 2. Eliminar lotes (depende de formulas)
DELETE FROM batches;

-- 3. Eliminar items de fórmulas (depende de formulas e ingredients)
DELETE FROM formula_items;

-- 4. Eliminar fórmulas (depende de colors)
DELETE FROM formulas;

-- 5. Eliminar colores (depende de products)
DELETE FROM colors;

-- 6. Eliminar productos
DELETE FROM products;

-- 7. Eliminar ingredientes
DELETE FROM ingredients;

-- 8. Eliminar logs de auditoría
DELETE FROM audit_logs;

-- =====================================================
-- PASO 2: Resetear secuencias (si aplica)
-- =====================================================
-- Las tablas usan UUID así que no hay secuencias que resetear

-- =====================================================
-- PASO 3: Reactivar triggers
-- =====================================================
SET session_replication_role = 'origin';

-- =====================================================
-- VERIFICACIÓN: Contar registros en cada tabla
-- =====================================================
SELECT 'batch_items' as tabla, COUNT(*) as registros FROM batch_items
UNION ALL
SELECT 'batches', COUNT(*) FROM batches
UNION ALL
SELECT 'formula_items', COUNT(*) FROM formula_items
UNION ALL
SELECT 'formulas', COUNT(*) FROM formulas
UNION ALL
SELECT 'colors', COUNT(*) FROM colors
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'ingredients', COUNT(*) FROM ingredients
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles;

-- =====================================================
-- NOTA: Este script NO elimina:
-- - user_roles (roles de usuarios - importante para autenticación)
-- - Datos de auth.users (manejado por Supabase Auth)
-- - Configuraciones del bucket de storage
-- =====================================================
