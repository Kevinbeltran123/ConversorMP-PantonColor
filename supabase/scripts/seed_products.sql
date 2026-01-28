-- =====================================================
-- SCRIPT: Insertar productos iniciales
-- Ejecutar en Supabase Dashboard > SQL Editor
-- =====================================================

-- Insertar productos base para Graniplast
INSERT INTO products (id, name, description, active, created_by, updated_by)
VALUES
  (
    gen_random_uuid(),
    'Graniplast',
    'Pintura texturizada para exteriores e interiores',
    true,
    NULL,
    NULL
  ),
  (
    gen_random_uuid(),
    'Vinilo',
    'Pintura vinílica para interiores',
    true,
    NULL,
    NULL
  )
ON CONFLICT (name) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT id, name, description, active, created_at
FROM products
ORDER BY name;

-- =====================================================
-- RESULTADO ESPERADO: 4 productos (o los que ya existían)
-- =====================================================
