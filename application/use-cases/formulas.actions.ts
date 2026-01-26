'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'
import { isAdmin } from './roles.actions'
import { createFormulaSchema, updateFormulaSchema } from '@/lib/validations/formula.schemas'
import type { FormulaWithItems, FormulaWithColor } from '@/application/dtos/formula.dto'

export async function getFormulas() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('formulas')
    .select(
      `
      *,
      items:formula_items (
        id,
        ingredient_id,
        quantity_g,
        position,
        ingredient:ingredients (
          id,
          name
        )
      ),
      color:colors (
        id,
        name,
        product:products (
          id,
          name
        )
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data: data as unknown as FormulaWithColor[] }
}

export async function getFormulasByColorId(colorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('formulas')
    .select(
      `
      *,
      items:formula_items (
        id,
        ingredient_id,
        quantity_g,
        position,
        ingredient:ingredients (
          id,
          name
        )
      )
    `
    )
    .eq('color_id', colorId)
    .order('version', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data: data as unknown as FormulaWithItems[] }
}

export async function getFormulaById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('formulas')
    .select(
      `
      *,
      items:formula_items (
        id,
        ingredient_id,
        quantity_g,
        position,
        ingredient:ingredients (
          id,
          name,
          description
        )
      ),
      color:colors (
        id,
        name,
        product:products (
          id,
          name
        )
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Ordenar items por posición
  const formula = data as unknown as FormulaWithColor
  formula.items.sort((a, b) => a.position - b.position)

  return { data: formula }
}

export async function createFormula(input: unknown) {
  // Verificar permisos
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden crear fórmulas' }
  }

  // Validar input
  const parsed = createFormulaSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Verificar que la suma de ingredientes no exceda la cantidad base
  const totalIngredients = parsed.data.items.reduce((sum, item) => sum + item.quantity_g, 0)
  if (totalIngredients > parsed.data.base_total_g) {
    return {
      error: `La suma de ingredientes (${totalIngredients}g) excede la cantidad base (${parsed.data.base_total_g}g)`,
    }
  }

  // Crear fórmula (el trigger asignará la versión automáticamente)
  const { data: formula, error: formulaError } = await supabase
    .from('formulas')
    .insert({
      color_id: parsed.data.color_id,
      base_total_g: parsed.data.base_total_g,
      is_active: parsed.data.is_active,
      notes: parsed.data.notes,
    })
    .select()
    .single()

  if (formulaError) {
    return { error: formulaError.message }
  }

  // Crear items de la fórmula
  const itemsToInsert = parsed.data.items.map((item, index) => ({
    formula_id: formula.id,
    ingredient_id: item.ingredient_id,
    quantity_g: item.quantity_g,
    position: item.position || index,
  }))

  const { error: itemsError } = await supabase.from('formula_items').insert(itemsToInsert)

  if (itemsError) {
    // Si falla, eliminar la fórmula creada
    await supabase.from('formulas').delete().eq('id', formula.id)
    return { error: itemsError.message }
  }

  revalidatePath('/colors')
  revalidatePath(`/colors/${parsed.data.color_id}`)
  revalidatePath('/formulas')

  return { data: formula }
}

export async function updateFormula(id: string, input: unknown) {
  // Verificar permisos
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden actualizar fórmulas' }
  }

  // Validar input
  const parsed = updateFormulaSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('formulas')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Obtener color_id para revalidación
  const { data: formula } = await supabase
    .from('formulas')
    .select('color_id')
    .eq('id', id)
    .single()

  if (formula) {
    revalidatePath(`/colors/${formula.color_id}`)
  }
  revalidatePath('/formulas')

  return { data }
}

export async function deleteFormula(id: string) {
  // Verificar permisos
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden eliminar fórmulas' }
  }

  const supabase = await createClient()

  // Verificar que no haya lotes usando esta fórmula
  const { data: batches } = await supabase.from('batches').select('id').eq('formula_id', id).limit(1)

  if (batches && batches.length > 0) {
    return { error: 'No se puede eliminar una fórmula que tiene lotes asociados' }
  }

  const { error } = await supabase.from('formulas').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/colors')
  revalidatePath('/formulas')
  return {}
}
