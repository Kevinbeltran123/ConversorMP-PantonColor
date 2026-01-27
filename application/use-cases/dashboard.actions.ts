'use server'

import { createClient } from '@/infrastructure/supabase/server'

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const supabase = await createClient()

  // Get total colors count
  const { count: colorsCount, error: colorsError } = await supabase
    .from('colors')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)

  if (colorsError) {
    return {
      error: 'Error al cargar estadísticas',
      data: null,
    }
  }

  return {
    data: {
      colorsCount: colorsCount ?? 0,
    },
    error: null,
  }
}
