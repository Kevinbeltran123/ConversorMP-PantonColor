-- =====================================================
-- SCRIPT RÁPIDO: TRUNCATE todas las tablas
-- ADVERTENCIA: Elimina TODOS los datos incluyendo productos e ingredientes
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

-- TRUNCATE es más rápido que DELETE y resetea todo
-- CASCADE elimina automáticamente los datos dependientes

TRUNCATE TABLE
  batch_items,
  batches,
  formula_items,
  formulas,
  colors,
  products,
  ingredients,
  audit_logs
CASCADE;

-- Verificar que todo está vacío
SELECT
  'batch_items' as tabla, COUNT(*) as total FROM batch_items
UNION ALL SELECT 'batches', COUNT(*) FROM batches
UNION ALL SELECT 'formula_items', COUNT(*) FROM formula_items
UNION ALL SELECT 'formulas', COUNT(*) FROM formulas
UNION ALL SELECT 'colors', COUNT(*) FROM colors
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'ingredients', COUNT(*) FROM ingredients;

-- =====================================================
-- NOTA: Después de ejecutar este script necesitarás
-- re-ejecutar los seeds para tener datos iniciales
-- =====================================================
