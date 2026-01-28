-- =====================================================
-- SCRIPT: Eliminar solo colores, fórmulas y lotes
-- PRESERVA: productos, ingredientes y roles de usuario
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

-- Desactivar temporalmente los triggers de auditoría
SET session_replication_role = 'replica';

-- =====================================================
-- Eliminar datos (orden por foreign keys)
-- =====================================================

-- 1. Eliminar items de lotes
DELETE FROM batch_items;
RAISE NOTICE 'batch_items eliminados';

-- 2. Eliminar lotes
DELETE FROM batches;
RAISE NOTICE 'batches eliminados';

-- 3. Eliminar items de fórmulas
DELETE FROM formula_items;
RAISE NOTICE 'formula_items eliminados';

-- 4. Eliminar fórmulas
DELETE FROM formulas;
RAISE NOTICE 'formulas eliminados';

-- 5. Eliminar colores
DELETE FROM colors;
RAISE NOTICE 'colors eliminados';

-- 6. Limpiar logs de auditoría relacionados
DELETE FROM audit_logs
WHERE table_name IN ('colors', 'formulas', 'formula_items', 'batches', 'batch_items');

-- Reactivar triggers
SET session_replication_role = 'origin';

-- =====================================================
-- Verificación
-- =====================================================
SELECT
  'DATOS ELIMINADOS' as status,
  (SELECT COUNT(*) FROM colors) as colores,
  (SELECT COUNT(*) FROM formulas) as formulas,
  (SELECT COUNT(*) FROM batches) as lotes;

SELECT
  'DATOS PRESERVADOS' as status,
  (SELECT COUNT(*) FROM products) as productos,
  (SELECT COUNT(*) FROM ingredients) as ingredientes,
  (SELECT COUNT(*) FROM user_roles) as roles;
