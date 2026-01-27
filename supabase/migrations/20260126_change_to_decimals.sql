-- =====================================================
-- Cambiar cantidades de INTEGER a DECIMAL para mayor precisión
-- =====================================================
-- Sprint 3 Fix: Permitir decimales en cantidades (ej: 1.25g en lugar de solo 1g o 2g)
-- Esto es crítico para ingredientes con cantidades pequeñas que se pierden al redondear
-- =====================================================

-- 1. FORMULAS - Cambiar base_total_g a DECIMAL
ALTER TABLE public.formulas
  ALTER COLUMN base_total_g TYPE DECIMAL(10, 2);

COMMENT ON COLUMN public.formulas.base_total_g IS 'Cantidad base total en GRAMOS (permite hasta 2 decimales)';

-- 2. FORMULA_ITEMS - Cambiar quantity_g a DECIMAL
ALTER TABLE public.formula_items
  ALTER COLUMN quantity_g TYPE DECIMAL(10, 2);

COMMENT ON COLUMN public.formula_items.quantity_g IS 'Cantidad del ingrediente en GRAMOS (permite hasta 2 decimales)';

-- 3. BATCHES - Cambiar target_total_g a DECIMAL
ALTER TABLE public.batches
  ALTER COLUMN target_total_g TYPE DECIMAL(10, 2);

COMMENT ON COLUMN public.batches.target_total_g IS 'Cantidad objetivo en GRAMOS (permite hasta 2 decimales)';

-- 4. BATCH_ITEMS - Cambiar quantity_g a DECIMAL
ALTER TABLE public.batch_items
  ALTER COLUMN quantity_g TYPE DECIMAL(10, 2);

COMMENT ON COLUMN public.batch_items.quantity_g IS 'Cantidad escalada en GRAMOS (permite hasta 2 decimales)';

-- Verificar cambios
SELECT
  table_name,
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('formulas', 'formula_items', 'batches', 'batch_items')
  AND column_name LIKE '%_g'
ORDER BY table_name, column_name;
