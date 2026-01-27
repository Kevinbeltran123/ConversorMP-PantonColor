'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createBatch } from '@/application/use-cases/batches.actions'
import type { BatchCalculationResult } from '@/application/dtos/batch.dto'
import type { FormulaWithColor } from '@/application/dtos/formula.dto'
import { formatQuantity } from '@/lib/utils/scaling'
import { gramsToKg } from '@/lib/utils/units'

interface BatchResultProps {
  formula: FormulaWithColor
  calculation: BatchCalculationResult
  targetKg: number
}

export function BatchResult({ formula, calculation, targetKg }: BatchResultProps) {
  const router = useRouter()
  const [observations, setObservations] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const formatKgFromGrams = (grams: number) => `${gramsToKg(grams).toFixed(2)} kg`

  async function handleSave() {
    setSaving(true)
    setError('')

    try {
      const result = await createBatch({
        formula_id: calculation.formula_id,
        target_total_g: calculation.target_total_g,
        observations,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      router.push('/batches')
    } catch {
      setError('Error al guardar el lote')
    } finally {
      setSaving(false)
    }
  }

  function handlePrintPreview() {
    const printData = {
      formula: {
        id: formula.id,
        version: formula.version,
        base_total: formula.base_total_g,
        is_active: formula.is_active,
        notes: formula.notes,
        color: {
          id: formula.color.id,
          name: formula.color.name,
          product: {
            id: formula.color.product.id,
            name: formula.color.product.name,
          },
        },
      },
      calculation: {
        scaleFactor: calculation.scale_factor,
        targetTotal: calculation.target_total_g,
        actualTotal: calculation.total_scaled_g,
        roundingDifference: calculation.rounding_difference_g,
        items: calculation.items.map((item) => ({
          ingredientId: item.ingredient_id,
          ingredientName: item.ingredient_name,
          originalQuantity: item.original_quantity_g,
          scaledQuantity: item.scaled_quantity_g,
          position: item.position,
        })),
      },
      observations,
    }

    const encodedData = encodeURIComponent(JSON.stringify(printData))
    router.push(`/batches/print/preview?data=${encodedData}`)
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="text-2xl font-semibold text-gray-950">3. Resultado del Cálculo</h2>
        <p className="mt-1 text-sm text-gray-600">
          Fórmula v{formula.version} · Objetivo: {targetKg.toFixed(2)} kg
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 rounded-md bg-gray-50 p-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Base</p>
            <p className="mt-1 text-2xl font-semibold text-gray-950">
              {formatKgFromGrams(calculation.base_total_g)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Objetivo</p>
            <p className="mt-1 text-2xl font-semibold text-gray-950">
              {formatKgFromGrams(calculation.target_total_g)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Factor</p>
            <p className="mt-1 text-2xl font-semibold text-gray-950">
              {calculation.scale_factor.toFixed(4)}x
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-950">Ingredientes escalados</h3>
              <p className="mt-1 text-sm text-gray-600">
                Cantidades listas para preparar el lote.
              </p>
            </div>
            <p className="text-sm font-medium text-gray-600">{calculation.items.length} en total</p>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                    Ingrediente
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider text-gray-600">
                    Original
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider text-gray-600">
                    Escalado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {calculation.items.map((item, index) => (
                  <tr key={`${item.ingredient_id}-${index}`}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {item.ingredient_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">
                      {formatQuantity(item.original_quantity_g)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatQuantity(item.scaled_quantity_g)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    {formatQuantity(
                      calculation.items.reduce((sum, item) => sum + item.original_quantity_g, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                    {formatQuantity(calculation.total_scaled_g)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="text-2xl font-semibold text-gray-950">4. Guardar Lote</h2>
        <div className="mt-4">
          <label htmlFor="observations" className="block text-base font-semibold text-gray-800">
            Observaciones (opcional)
          </label>
          <textarea
            id="observations"
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas sobre este lote..."
            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <Button variant="secondary" onClick={handlePrintPreview} disabled={saving}>
            🖨️ Vista Previa de Impresión
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/batches/new?formulaId=${formula.id}`)}
              disabled={saving}
            >
              Volver
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Lote'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

