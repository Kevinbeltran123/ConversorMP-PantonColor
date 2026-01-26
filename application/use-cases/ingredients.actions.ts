'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'
import { isAdmin } from './roles.actions'
import {
  createIngredientSchema,
  updateIngredientSchema,
} from '@/lib/validations/ingredient.schemas'

export async function getIngredients(search?: string) {
  const supabase = await createClient()

  let query = supabase.from('ingredients').select('*').eq('active', true).order('name')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getIngredientById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from('ingredients').select('*').eq('id', id).single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createIngredient(input: unknown) {
  // Verificar permisos
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden crear ingredientes' }
  }

  // Validar input
  const parsed = createIngredientSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Verificar que no exista un ingrediente con el mismo nombre
  const { data: existing } = await supabase
    .from('ingredients')
    .select('id')
    .eq('name', parsed.data.name)
    .single()

  if (existing) {
    return { error: 'Ya existe un ingrediente con ese nombre' }
  }

  const { data, error } = await supabase
    .from('ingredients')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/formulas')
  return { data }
}

export async function updateIngredient(id: string, input: unknown) {
  // Verificar permisos
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden actualizar ingredientes' }
  }

  // Validar input
  const parsed = updateIngredientSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Si se actualiza el nombre, verificar duplicados
  if (parsed.data.name) {
    const { data: existing } = await supabase
      .from('ingredients')
      .select('id')
      .eq('name', parsed.data.name)
      .neq('id', id)
      .single()

    if (existing) {
      return { error: 'Ya existe un ingrediente con ese nombre' }
    }
  }

  const { data, error } = await supabase
    .from('ingredients')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/formulas')
  return { data }
}
