'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { calculateBatch, createBatch } from '@/application/use-cases/batches.actions'
import type { BatchCalculationResult } from '@/application/dtos/batch.dto'
import type { FormulaWithColor } from '@/application/dtos/formula.dto'
import {
  formatRoundingDifference,
  getRoundingStatusColor,
  isRoundingAcceptable,
} from '@/lib/utils/scaling'

interface BatchCalculatorProps {
  formulas: FormulaWithColor[]
}

export function BatchCalculator({ formulas }: BatchCalculatorProps) {
  const router = useRouter()
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('')
  const [targetAmount, setTargetAmount] = useState<string>('')
  const [observations, setObservations] = useState<string>('')
  const [calculation, setCalculation] = useState<BatchCalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [saving, setSaving] = useState(false)

  async function handleCalculate() {
    if (!selectedFormulaId || !targetAmount) {
      setError('Selecciona una fórmula e ingresa una cantidad objetivo')
      return
    }

    const targetAmountNum = parseInt(targetAmount, 10)
    if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
      setError('La cantidad objetivo debe ser un número positivo')
      return
    }

    setLoading(true)
    setError('')
    setCalculation(null)

    try {
      const result = await calculateBatch({
        formula_id: selectedFormulaId,
        target_total_g: targetAmountNum,
      })

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setCalculation(result.data)
      }
    } catch {
      setError('Error al calcular el lote')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!calculation) return

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
      } else {
        router.push('/batches')
      }
    } catch {
      setError('Error al guardar el lote')
    } finally {
      setSaving(false)
    }
  }

  const selectedFormula = formulas.find((f) => f.id === selectedFormulaId)

  return (
    <div className="space-y-6">
      {/* Formula Selection */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">1. Seleccionar Fórmula</h2>
        <div className="mt-4">
          <select
            value={selectedFormulaId}
            onChange={(e) => {
              setSelectedFormulaId(e.target.value)
              setCalculation(null)
            }}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selecciona una fórmula...</option>
            {formulas
              .filter((f) => f.is_active)
              .map((formula) => (
                <option key={formula.id} value={formula.id}>
                  {formula.color.product.name} - {formula.color.name} (v{formula.version}) -{' '}
                  {formula.base_total_g}g base
                </option>
              ))}
          </select>
        </div>

        {selectedFormula && (
          <div className="mt-4 rounded-md bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Producto:</span>
                <span className="ml-2 text-gray-900">{selectedFormula.color.product.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Color:</span>
                <span className="ml-2 text-gray-900">{selectedFormula.color.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Versión:</span>
                <span className="ml-2 text-gray-900">v{selectedFormula.version}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Base:</span>
                <span className="ml-2 text-gray-900">{selectedFormula.base_total_g}g</span>
              </div>
            </div>
            {selectedFormula.notes && (
              <p className="mt-2 text-sm text-gray-600">{selectedFormula.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* Target Amount */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">2. Cantidad Objetivo</h2>
        <div className="mt-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700">
                Cantidad objetivo (gramos)
              </label>
              <Input
                id="targetAmount"
                type="number"
                min="1"
                value={targetAmount}
                onChange={(e) => {
                  setTargetAmount(e.target.value)
                  setCalculation(null)
                }}
                placeholder="Ej: 20000"
                className="mt-1"
              />
            </div>
            <Button onClick={handleCalculate} disabled={loading || !selectedFormulaId || !targetAmount}>
              {loading ? 'Calculando...' : 'Calcular'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {/* Calculation Results */}
      {calculation && (
        <>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">3. Resultado del Cálculo</h2>

            {/* Summary */}
            <div className="mt-4 grid grid-cols-3 gap-4 rounded-md bg-gray-50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Base</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {calculation.base_total_g.toLocaleString()}g
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Objetivo</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {calculation.target_total_g.toLocaleString()}g
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Factor</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {calculation.scale_factor.toFixed(4)}x
                </p>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900">Ingredientes Escalados</h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Ingrediente
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Original
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Escalado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {calculation.items.map((item, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          {item.ingredient_name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">
                          {item.original_quantity_g.toLocaleString()}g
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                          {item.scaled_quantity_g.toLocaleString()}g
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                        {calculation.items.reduce((sum, item) => sum + item.original_quantity_g, 0).toLocaleString()}g
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        {calculation.total_scaled_g.toLocaleString()}g
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rounding Difference */}
            <div className="mt-4 rounded-md bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Diferencia por Redondeo</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Diferencia entre el objetivo y la suma de ingredientes redondeados
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getRoundingStatusColor(calculation.rounding_difference_g, calculation.target_total_g)}`}>
                    {formatRoundingDifference(calculation.rounding_difference_g)}
                  </p>
                  {!isRoundingAcceptable(calculation.rounding_difference_g, calculation.target_total_g) && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      ⚠️ Diferencia mayor al 1%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Observations and Save */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">4. Guardar Lote</h2>
            <div className="mt-4">
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700">
                Observaciones (opcional)
              </label>
              <textarea
                id="observations"
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Notas sobre este lote..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/batches')}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Lote'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
