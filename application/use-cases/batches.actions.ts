'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/infrastructure/supabase/server'
import { isAdmin } from './roles.actions'
import { calculateBatchSchema, createBatchSchema } from '@/lib/validations/batch.schemas'
import { calculateBatch as calculateBatchUtil } from '@/lib/utils/scaling'
import type { BatchCalculationResult, BatchWithFormula } from '@/application/dtos/batch.dto'
import type { FormulaWithItems } from '@/application/dtos/formula.dto'

/**
 * Calculate scaled ingredients for a batch without saving
 */
export async function calculateBatch(input: unknown) {
  // Validate input
  const parsed = calculateBatchSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Get formula with items
  const { data: formula, error: formulaError } = await supabase
    .from('formulas')
    .select(
      `
      id,
      color_id,
      version,
      base_total_g,
      is_active,
      notes,
      created_at,
      created_by,
      items:formula_items (
        id,
        formula_id,
        ingredient_id,
        quantity_g,
        position,
        ingredient:ingredients (
          id,
          name,
          description
        )
      )
    `
    )
    .eq('id', parsed.data.formula_id)
    .single()

  if (formulaError || !formula) {
    return { error: 'Fórmula no encontrada' }
  }

  const formulaWithItems = formula as unknown as FormulaWithItems

  // Check formula is active
  if (!formulaWithItems.is_active) {
    return { error: 'La fórmula no está activa' }
  }

  // Calculate batch
  const calculation = calculateBatchUtil(
    formulaWithItems.id,
    formulaWithItems.base_total_g,
    parsed.data.target_total_g,
    formulaWithItems.items
  )

  return { data: calculation as BatchCalculationResult }
}

/**
 * Create and save a new batch
 */
export async function createBatch(input: unknown) {
  // Validate input
  const parsed = createBatchSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Get formula with items
  const { data: formula, error: formulaError } = await supabase
    .from('formulas')
    .select(
      `
      id,
      color_id,
      version,
      base_total_g,
      is_active,
      notes,
      created_at,
      created_by,
      items:formula_items (
        id,
        formula_id,
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
    .eq('id', parsed.data.formula_id)
    .single()

  if (formulaError || !formula) {
    return { error: 'Fórmula no encontrada' }
  }

  const formulaWithItems = formula as unknown as FormulaWithItems

  // Check formula is active
  if (!formulaWithItems.is_active) {
    return { error: 'La fórmula no está activa' }
  }

  // Calculate batch
  const calculation = calculateBatchUtil(
    formulaWithItems.id,
    formulaWithItems.base_total_g,
    parsed.data.target_total_g,
    formulaWithItems.items
  )

  // Create batch record
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .insert({
      formula_id: parsed.data.formula_id,
      target_total_g: parsed.data.target_total_g,
      scale_factor: calculation.scale_factor,
      observations: parsed.data.observations || null,
    })
    .select()
    .single()

  if (batchError) {
    return { error: batchError.message }
  }

  // Create batch items
  const batchItems = calculation.items.map((item) => ({
    batch_id: batch.id,
    ingredient_id: item.ingredient_id,
    ingredient_name: item.ingredient_name,
    quantity_g: item.scaled_quantity_g,
    position: item.position,
  }))

  const { error: itemsError } = await supabase.from('batch_items').insert(batchItems)

  if (itemsError) {
    // Rollback: delete the batch
    await supabase.from('batches').delete().eq('id', batch.id)
    return { error: itemsError.message }
  }

  revalidatePath('/batches')
  revalidatePath(`/formulas`)

  return { data: batch }
}

/**
 * Get all batches with formula and color information
 */
export async function getBatches() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('batches')
    .select(
      `
      id,
      formula_id,
      target_total_g,
      scale_factor,
      observations,
      created_at,
      created_by,
      formula:formulas (
        id,
        version,
        base_total_g,
        color:colors (
          id,
          name,
          product:products (
            id,
            name
          )
        )
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * Get a single batch by ID with all details
 */
export async function getBatchById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('batches')
    .select(
      `
      id,
      formula_id,
      target_total_g,
      scale_factor,
      observations,
      created_at,
      created_by,
      items:batch_items (
        id,
        batch_id,
        ingredient_id,
        ingredient_name,
        quantity_g,
        position,
        ingredient:ingredients (
          id,
          name,
          description
        )
      ),
      formula:formulas (
        id,
        version,
        base_total_g,
        is_active,
        notes,
        color:colors (
          id,
          name,
          product:products (
            id,
            name
          )
        )
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  // Sort items by position
  const batch = data as unknown as BatchWithFormula
  batch.items.sort((a, b) => a.position - b.position)

  return { data: batch }
}

/**
 * Delete a batch (admin only)
 */
export async function deleteBatch(id: string) {
  // Check admin permissions
  const admin = await isAdmin()
  if (!admin) {
    return { error: 'Solo administradores pueden eliminar lotes' }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('batches').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/batches')
  return {}
}
