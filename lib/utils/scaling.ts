import type { FormulaItemWithIngredient } from '@/application/dtos/formula.dto'
import type { ScaledIngredientItem, BatchCalculationResult } from '@/application/dtos/batch.dto'

// =====================================================
// SCALING CALCULATIONS
// =====================================================

/**
 * Calculate the scale factor from base amount to target amount
 * @param baseAmount - Original formula base amount in grams
 * @param targetAmount - Target batch amount in grams
 * @returns Scale factor (targetAmount / baseAmount)
 */
export function calculateScaleFactor(baseAmount: number, targetAmount: number): number {
  if (baseAmount <= 0) {
    throw new Error('Base amount must be greater than 0')
  }
  if (targetAmount <= 0) {
    throw new Error('Target amount must be greater than 0')
  }
  return targetAmount / baseAmount
}

/**
 * Scale a single ingredient quantity
 * @param originalQuantity - Original quantity in grams
 * @param scaleFactor - Scale factor to apply
 * @returns Scaled quantity rounded to 2 decimal places
 */
export function scaleQuantity(originalQuantity: number, scaleFactor: number): number {
  const scaled = originalQuantity * scaleFactor
  return Math.round(scaled * 100) / 100
}

/**
 * Calculate scaled ingredients for a batch
 * @param formulaItems - Original formula items with ingredients
 * @param scaleFactor - Scale factor to apply
 * @returns Array of scaled ingredient items
 */
export function scaleFormulaItems(
  formulaItems: FormulaItemWithIngredient[],
  scaleFactor: number
): ScaledIngredientItem[] {
  return formulaItems.map((item) => ({
    ingredient_id: item.ingredient_id,
    ingredient_name: item.ingredient.name,
    original_quantity_g: item.quantity_g,
    scaled_quantity_g: scaleQuantity(item.quantity_g, scaleFactor),
    position: item.position,
  }))
}

/**
 * Calculate total of scaled quantities
 * @param scaledItems - Array of scaled ingredient items
 * @returns Total of all scaled quantities in grams
 */
export function calculateScaledTotal(scaledItems: ScaledIngredientItem[]): number {
  return scaledItems.reduce((sum, item) => sum + item.scaled_quantity_g, 0)
}

/**
 * Calculate rounding difference (discrepancy between target and actual total)
 * @param targetAmount - Target batch amount in grams
 * @param actualAmount - Actual total of scaled ingredients in grams
 * @returns Difference in grams (can be positive or negative)
 */
export function calculateRoundingDifference(targetAmount: number, actualAmount: number): number {
  return targetAmount - actualAmount
}

/**
 * Validate rounding difference is within acceptable threshold
 * @param difference - Rounding difference in grams
 * @param targetAmount - Target batch amount in grams
 * @param maxPercentage - Maximum acceptable difference as percentage (default 1%)
 * @returns True if difference is acceptable
 */
export function isRoundingAcceptable(
  difference: number,
  targetAmount: number,
  maxPercentage: number = 1
): boolean {
  const percentageDiff = Math.abs(difference / targetAmount) * 100
  return percentageDiff <= maxPercentage
}

/**
 * Calculate a complete batch with all validations
 * @param formulaId - Formula ID
 * @param baseTotal - Base total amount of the formula in grams
 * @param targetTotal - Target batch amount in grams
 * @param formulaItems - Formula items with ingredients
 * @returns Complete batch calculation result
 */
export function calculateBatch(
  formulaId: string,
  baseTotal: number,
  targetTotal: number,
  formulaItems: FormulaItemWithIngredient[]
): BatchCalculationResult {
  // Calculate scale factor
  const scaleFactor = calculateScaleFactor(baseTotal, targetTotal)

  // Scale all items
  const scaledItems = scaleFormulaItems(formulaItems, scaleFactor)

  // Calculate totals and difference
  const totalScaled = calculateScaledTotal(scaledItems)
  const roundingDiff = calculateRoundingDifference(targetTotal, totalScaled)

  return {
    formula_id: formulaId,
    base_total_g: baseTotal,
    target_total_g: targetTotal,
    scale_factor: scaleFactor,
    items: scaledItems,
    total_scaled_g: totalScaled,
    rounding_difference_g: roundingDiff,
  }
}

/**
 * Format rounding difference for display
 * @param difference - Rounding difference in grams
 * @returns Formatted string with sign
 */
export function formatRoundingDifference(difference: number): string {
  const sign = difference >= 0 ? '+' : ''
  return `${sign}${difference}g`
}

/**
 * Get rounding status color class for UI
 * @param difference - Rounding difference in grams
 * @param targetAmount - Target batch amount in grams
 * @returns Tailwind color class
 */
export function getRoundingStatusColor(difference: number, targetAmount: number): string {
  if (difference === 0) return 'text-green-600'
  if (isRoundingAcceptable(difference, targetAmount, 0.5)) return 'text-green-600'
  if (isRoundingAcceptable(difference, targetAmount, 1)) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Format quantity for display (shows up to 2 decimals, removes trailing zeros)
 * @param quantity - Quantity in grams
 * @returns Formatted string with 'g' suffix
 */
export function formatQuantity(quantity: number): string {
  // Round to 2 decimals and remove trailing zeros
  const rounded = Math.round(quantity * 100) / 100
  return `${rounded.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}g`
}
