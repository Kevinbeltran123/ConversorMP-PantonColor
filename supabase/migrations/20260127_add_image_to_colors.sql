-- Agregar campo de imagen a la tabla colors
ALTER TABLE colors
ADD COLUMN image_url TEXT;

-- Comentario para documentar el campo
COMMENT ON COLUMN colors.image_url IS 'URL de la imagen del color almacenada en Supabase Storage';

-- Crear política de storage para el bucket de imágenes de colores
-- Nota: El bucket 'color-images' debe crearse manualmente en Supabase Dashboard
-- Ver SUPABASE_STORAGE_SETUP.md para instrucciones

-- Política para permitir a usuarios autenticados subir imágenes
INSERT INTO storage.buckets (id, name, public)
VALUES ('color-images', 'color-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Permitir lectura pública de imágenes
CREATE POLICY "Public read access for color images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'color-images');

-- Política: Permitir a usuarios autenticados subir imágenes
CREATE POLICY "Authenticated users can upload color images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'color-images');

-- Política: Permitir a usuarios autenticados actualizar sus propias imágenes
CREATE POLICY "Authenticated users can update color images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'color-images');

-- Política: Permitir a usuarios autenticados eliminar imágenes
CREATE POLICY "Authenticated users can delete color images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'color-images');
