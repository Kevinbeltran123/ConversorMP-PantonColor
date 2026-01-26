-- =====================================================
-- SEEDS - Datos Iniciales
-- Sistema ConversorMP - Graniplast
-- =====================================================

-- =====================================================
-- PRODUCTS
-- =====================================================
INSERT INTO public.products (name, description, active)
VALUES
  ('Graniplast', 'Pintura texturizada Graniplast', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INGREDIENTS
-- =====================================================
-- Ingredientes comunes para pinturas Graniplast
INSERT INTO public.ingredients (name, description, active)
VALUES
  ('Colanil', 'Colorante sintético base', true),
  ('Negro', 'Pigmento negro', true),
  ('Blanco', 'Pigmento blanco titanio', true),
  ('Amarillo', 'Pigmento amarillo', true),
  ('Rojo', 'Pigmento rojo óxido', true),
  ('Azul', 'Pigmento azul ftalo', true),
  ('Verde', 'Pigmento verde', true),
  ('Naranja', 'Pigmento naranja', true),
  ('Base Graniplast', 'Base texturizada Graniplast', true),
  ('Resina Acrílica', 'Resina acrílica para pintura', true),
  ('Agua', 'Agua desmineralizada', true),
  ('Aditivo Antihongos', 'Fungicida para pinturas', true),
  ('Espesante', 'Espesante celulósico', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- EJEMPLO: Color de prueba (Opcional)
-- =====================================================
-- Este bloque es opcional, solo para testing inicial
-- Puedes comentarlo si prefieres crear los colores desde la UI

-- Obtener el ID del producto Graniplast
DO $$
DECLARE
  graniplast_id UUID;
  azul_cielo_id UUID;
  formula_id UUID;
  colanil_id UUID;
  negro_id UUID;
  base_id UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO graniplast_id FROM public.products WHERE name = 'Graniplast';
  SELECT id INTO colanil_id FROM public.ingredients WHERE name = 'Colanil';
  SELECT id INTO negro_id FROM public.ingredients WHERE name = 'Negro';
  SELECT id INTO base_id FROM public.ingredients WHERE name = 'Base Graniplast';

  -- Solo crear si los IDs existen
  IF graniplast_id IS NOT NULL AND colanil_id IS NOT NULL THEN

    -- Crear color de ejemplo (solo si no existe)
    INSERT INTO public.colors (product_id, name, notes, active)
    VALUES (graniplast_id, 'Azul Cielo', 'Color de prueba para testing', true)
    ON CONFLICT (product_id, name) DO NOTHING
    RETURNING id INTO azul_cielo_id;

    -- Si el color fue creado, agregar fórmula de ejemplo
    IF azul_cielo_id IS NOT NULL THEN
      -- Crear fórmula base de 200kg (200000g)
      INSERT INTO public.formulas (color_id, version, base_total_g, is_active, notes)
      VALUES (azul_cielo_id, 1, 200000, true, 'Fórmula base de prueba')
      RETURNING id INTO formula_id;

      -- Agregar ingredientes a la fórmula
      IF formula_id IS NOT NULL THEN
        INSERT INTO public.formula_items (formula_id, ingredient_id, quantity_g, position)
        VALUES
          (formula_id, base_id, 180000, 1),      -- 180 kg de base
          (formula_id, colanil_id, 15000, 2),    -- 15 kg de colanil
          (formula_id, negro_id, 5000, 3);       -- 5 kg de negro
      END IF;
    END IF;

  END IF;
END $$;
