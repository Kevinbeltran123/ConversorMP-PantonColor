'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'
import { isAdmin } from './roles.actions'
import { createColorSchema, updateColorSchema } from '@/lib/validations/color.schemas'
import type { ColorWithProduct, ColorWithFormulas } from '@/application/dtos/color.dto'

export async function getColors(search?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('colors')
    .select(
      `
      id,
      name,
      notes,
      active,
      created_at,
      product:products (
        id,
        name
      )
    `
    )
    .order('name')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data: data as unknown as ColorWithProduct[] }
}

export async function getColorById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('colors')
    .select(
      `
      *,
      product:products (*),
      formulas:formulas (
        id,
        version,
        base_total_g,
        is_active,
        notes,
        created_at
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: data as unknown as ColorWithFormulas }
}

export async function createColor(input: unknown) {
  // Verificar permisos
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden crear colores' }
  }

  // Validar input
  const parsed = createColorSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Verificar que no exista un color con el mismo nombre para el producto
  const { data: existing } = await supabase
    .from('colors')
    .select('id')
    .eq('product_id', parsed.data.product_id)
    .eq('name', parsed.data.name)
    .single()

  if (existing) {
    return { error: 'Ya existe un color con ese nombre para este producto' }
  }

  const { data, error } = await supabase
    .from('colors')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/colors')
  return { data }
}

export async function updateColor(id: string, input: unknown) {
  // Verificar permisos
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden actualizar colores' }
  }

  // Validar input
  const parsed = updateColorSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Si se actualiza el nombre, verificar duplicados
  if (parsed.data.name) {
    const { data: color } = await supabase.from('colors').select('product_id').eq('id', id).single()

    if (color) {
      const { data: existing } = await supabase
        .from('colors')
        .select('id')
        .eq('product_id', color.product_id)
        .eq('name', parsed.data.name)
        .neq('id', id)
        .single()

      if (existing) {
        return { error: 'Ya existe un color con ese nombre para este producto' }
      }
    }
  }

  const { data, error } = await supabase
    .from('colors')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/colors')
  revalidatePath(`/colors/${id}`)
  return { data }
}

export async function deleteColor(id: string) {
  // Verificar permisos
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden eliminar colores' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('colors').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/colors')
  return {}
}

export async function getProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase.from('products').select('*').eq('active', true).order('name')

  if (error) {
    return { error: error.message }
  }

  return { data }
}
