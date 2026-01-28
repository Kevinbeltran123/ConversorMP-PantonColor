-- =====================================================
-- SCRIPT: Seed completo - Productos e Ingredientes iniciales
-- Ejecutar en Supabase Dashboard > SQL Editor
-- Este script inserta datos iniciales necesarios para empezar
-- =====================================================

-- =====================================================
-- PASO 1: Insertar Productos
-- =====================================================
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
  ),
  (
    gen_random_uuid(),
    'Esmalte',
    'Esmalte sintético de alta durabilidad',
    true,
    NULL,
    NULL
  ),
  (
    gen_random_uuid(),
    'Impermeabilizante',
    'Impermeabilizante acrílico',
    true,
    NULL,
    NULL
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 2: Insertar Ingredientes Base
-- =====================================================
INSERT INTO ingredients (id, name, description, active, created_by, updated_by)
VALUES
  -- Bases
  (gen_random_uuid(), 'Base Blanca', 'Base blanca para tintometría', true, NULL, NULL),
  (gen_random_uuid(), 'Base Transparente', 'Base transparente', true, NULL, NULL),
  (gen_random_uuid(), 'Base Pastel', 'Base para colores pasteles', true, NULL, NULL),

  -- Tintes
  (gen_random_uuid(), 'Tinte Negro', 'Colorante negro', true, NULL, NULL),
  (gen_random_uuid(), 'Tinte Rojo', 'Colorante rojo óxido', true, NULL, NULL),
  (gen_random_uuid(), 'Tinte Amarillo', 'Colorante amarillo óxido', true, NULL, NULL),
  (gen_random_uuid(), 'Tinte Azul', 'Colorante azul ftalocianina', true, NULL, NULL),
  (gen_random_uuid(), 'Tinte Verde', 'Colorante verde', true, NULL, NULL),
  (gen_random_uuid(), 'Tinte Naranja', 'Colorante naranja', true, NULL, NULL),
  (gen_random_uuid(), 'Tinte Marrón', 'Colorante café', true, NULL, NULL),

  -- Aditivos
  (gen_random_uuid(), 'Dispersante', 'Agente dispersante', true, NULL, NULL),
  (gen_random_uuid(), 'Espesante', 'Agente espesante', true, NULL, NULL),
  (gen_random_uuid(), 'Antiespumante', 'Antiespumante', true, NULL, NULL),
  (gen_random_uuid(), 'Biocida', 'Conservador', true, NULL, NULL),
  (gen_random_uuid(), 'Resina Acrílica', 'Resina principal', true, NULL, NULL),

  -- Cargas
  (gen_random_uuid(), 'Carbonato de Calcio', 'Carga mineral', true, NULL, NULL),
  (gen_random_uuid(), 'Talco', 'Carga fina', true, NULL, NULL),
  (gen_random_uuid(), 'Dióxido de Titanio', 'Pigmento blanco', true, NULL, NULL),
  (gen_random_uuid(), 'Caolín', 'Carga arcillosa', true, NULL, NULL),

  -- Otros
  (gen_random_uuid(), 'Agua Desmineralizada', 'Vehículo acuoso', true, NULL, NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN: Contar registros insertados
-- =====================================================
SELECT 'PRODUCTOS' as tipo, COUNT(*) as total FROM products
UNION ALL
SELECT 'INGREDIENTES', COUNT(*) FROM ingredients;

-- Listar productos
SELECT '------- PRODUCTOS -------' as info;
SELECT name, description FROM products ORDER BY name;

-- Listar ingredientes
SELECT '------- INGREDIENTES -------' as info;
SELECT name, description FROM ingredients ORDER BY name;

-- =====================================================
-- ✅ Script completado
-- Ahora puedes crear colores y fórmulas
-- =====================================================
