'use client'

// =====================================================
// CSV Export Utilities
// =====================================================
// Sprint 5: Export formulas and batches to CSV format

import type { FormulaWithDetails } from '@/application/dtos/formula.dto'
import type { BatchWithFormula } from '@/application/dtos/batch.dto'
import { formatQuantity } from './scaling'

/**
 * Converts a 2D array to CSV format
 */
function arrayToCSV(data: string[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escaped = cell.replace(/"/g, '""')
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
        })
        .join(',')
    )
    .join('\n')
}

/**
 * Triggers a browser download of CSV content
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Exports a single formula with its ingredients to CSV
 */
export function exportFormulaToCSV(formula: FormulaWithDetails): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `formula_${formula.product.name}_${formula.color.name}_v${formula.version}_${timestamp}.csv`

  // Header rows
  const data: string[][] = [
    ['Formula Export'],
    ['Product', formula.product.name],
    ['Color', formula.color.name],
    ['Version', formula.version.toString()],
    ['Base Quantity', formatQuantity(formula.base_total_g)],
    ['Status', formula.is_active ? 'Active' : 'Inactive'],
    ['Created At', new Date(formula.created_at).toLocaleString('es-MX')],
    ['Notes', formula.notes || ''],
    [], // Empty row
    ['#', 'Ingredient', 'Quantity (g)', '% of Total'], // Table header
  ]

  // Ingredient rows
  formula.items
    .sort((a, b) => a.position - b.position)
    .forEach((item, index) => {
      const percentage = ((item.quantity_g / formula.base_total_g) * 100).toFixed(2)
      data.push([
        (index + 1).toString(),
        item.ingredient.name,
        item.quantity_g.toString(),
        percentage,
      ])
    })

  // Total row
  const total = formula.items.reduce((sum, item) => sum + item.quantity_g, 0)
  data.push([
    '',
    'TOTAL',
    total.toString(),
    '100.00',
  ])

  const csv = arrayToCSV(data)
  downloadCSV(csv, filename)
}

/**
 * Exports a single batch with its scaled ingredients to CSV
 */
export function exportBatchToCSV(batch: BatchWithFormula): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const formula = batch.formula
  const color = formula.color
  const product = color.product

  const filename = `batch_${batch.id}_${timestamp}.csv`

  // Header rows
  const data: string[][] = [
    ['Batch Export'],
    ['Batch ID', batch.id],
    ['Product', product.name],
    ['Color', color.name],
    ['Formula Version', formula.version.toString()],
    ['Target Quantity', formatQuantity(batch.target_total_g)],
    ['Scale Factor', batch.scale_factor.toFixed(4)],
    ['Created At', new Date(batch.created_at).toLocaleString('es-MX')],
    ['Operator', batch.created_by || 'N/A'],
    ['Observations', batch.observations || ''],
    [], // Empty row
    ['#', 'Ingredient', 'Scaled Quantity (g)', 'Original Quantity (g)'], // Table header
  ]

  // Ingredient rows
  batch.items
    .sort((a, b) => a.position - b.position)
    .forEach((item, index) => {
      // Note: Original quantity is not available in BatchWithFormula
      // The batch already contains the scaled quantities
      data.push([
        (index + 1).toString(),
        item.ingredient.name,
        item.quantity_g.toString(),
        '', // Original quantity column left empty
      ])
    })

  // Total row
  const total = batch.items.reduce((sum, item) => sum + item.quantity_g, 0)
  const roundingDiff = batch.target_total_g - total
  data.push([
    '',
    'TOTAL',
    total.toString(),
    '',
  ])

  if (Math.abs(roundingDiff) > 0.01) {
    data.push([
      '',
      'Rounding Difference',
      roundingDiff.toFixed(2),
      '',
    ])
  }

  const csv = arrayToCSV(data)
  downloadCSV(csv, filename)
}

/**
 * Exports a list of formulas to CSV (summary view)
 */
export function exportFormulasListToCSV(
  formulas: Array<{
    id: string
    product_name: string
    color_name: string
    version: number
    base_total_g: number
    is_active: boolean
    items_count: number
    created_at: string
  }>
): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `formulas_list_${timestamp}.csv`

  // Header
  const data: string[][] = [
    [
      'Formula ID',
      'Product',
      'Color',
      'Version',
      'Base Quantity (g)',
      'Status',
      'Ingredients Count',
      'Created At',
    ],
  ]

  // Rows
  formulas.forEach((formula) => {
    data.push([
      formula.id,
      formula.product_name,
      formula.color_name,
      formula.version.toString(),
      formula.base_total_g.toString(),
      formula.is_active ? 'Active' : 'Inactive',
      formula.items_count.toString(),
      new Date(formula.created_at).toLocaleString('es-MX'),
    ])
  })

  const csv = arrayToCSV(data)
  downloadCSV(csv, filename)
}

/**
 * Exports a list of batches to CSV (summary view)
 */
export function exportBatchesListToCSV(
  batches: Array<{
    id: string
    product_name: string
    color_name: string
    formula_version: number
    target_total_g: number
    scale_factor: number
    items_count: number
    created_at: string
    created_by: string | null
  }>
): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `batches_list_${timestamp}.csv`

  // Header
  const data: string[][] = [
    [
      'Batch ID',
      'Product',
      'Color',
      'Formula Version',
      'Target Quantity (g)',
      'Scale Factor',
      'Ingredients Count',
      'Created At',
      'Operator',
    ],
  ]

  // Rows
  batches.forEach((batch) => {
    data.push([
      batch.id,
      batch.product_name,
      batch.color_name,
      batch.formula_version.toString(),
      batch.target_total_g.toString(),
      batch.scale_factor.toFixed(4),
      batch.items_count.toString(),
      new Date(batch.created_at).toLocaleString('es-MX'),
      batch.created_by || 'N/A',
    ])
  })

  const csv = arrayToCSV(data)
  downloadCSV(csv, filename)
}
