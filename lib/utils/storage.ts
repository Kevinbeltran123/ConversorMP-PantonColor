/**
 * Utilidades para manejar almacenamiento de archivos en Supabase Storage
 */

import { createClient } from '@/infrastructure/supabase/server';

const BUCKET_NAME = 'color-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Valida que el archivo sea una imagen válida
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Validar tipo de archivo
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP)',
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Sube una imagen al bucket de Supabase Storage
 * @param file - Archivo a subir
 * @param colorId - ID del color (para organizar archivos)
 * @returns URL pública de la imagen o null si falla
 */
export async function uploadColorImage(
  file: File,
  colorId: string
): Promise<{ url: string | null; error?: string }> {
  try {
    const supabase = await createClient();

    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: null, error: validation.error };
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${colorId}-${Date.now()}.${fileExt}`;
    const filePath = `colors/${fileName}`;

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { url: null, error: 'Error al subir la imagen' };
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return { url: publicUrl };
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return { url: null, error: 'Error inesperado al subir la imagen' };
  }
}

/**
 * Elimina una imagen del bucket de Supabase Storage
 * @param imageUrl - URL completa de la imagen
 * @returns true si se eliminó correctamente
 */
export async function deleteColorImage(imageUrl: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Extraer el path de la URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
    if (pathParts.length < 2) {
      console.error('Invalid image URL format');
      return false;
    }

    const filePath = pathParts[1];

    // Eliminar archivo
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting image:', error);
    return false;
  }
}

/**
 * Actualiza la imagen de un color (elimina la anterior y sube la nueva)
 * @param file - Nuevo archivo
 * @param colorId - ID del color
 * @param oldImageUrl - URL de la imagen anterior (opcional)
 * @returns URL pública de la nueva imagen o null si falla
 */
export async function updateColorImage(
  file: File,
  colorId: string,
  oldImageUrl?: string | null
): Promise<{ url: string | null; error?: string }> {
  // Eliminar imagen anterior si existe
  if (oldImageUrl) {
    await deleteColorImage(oldImageUrl);
  }

  // Subir nueva imagen
  return uploadColorImage(file, colorId);
}
