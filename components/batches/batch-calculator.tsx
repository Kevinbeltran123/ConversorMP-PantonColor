'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FormulaWithColor } from '@/application/dtos/formula.dto'
import { gramsToKg } from '@/lib/utils/units'

interface BatchCalculatorProps {
  formulas: FormulaWithColor[]
  initialFormulaId?: string
}

export function BatchCalculator({ formulas, initialFormulaId }: BatchCalculatorProps) {
  const router = useRouter()
  const hasInitialFormula = Boolean(
    initialFormulaId && formulas.some((formula) => formula.id === initialFormulaId && formula.is_active)
  )
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(
    hasInitialFormula ? (initialFormulaId as string) : ''
  )
  const [targetAmount, setTargetAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleCalculate() {
    if (!selectedFormulaId || !targetAmount) {
      setError('Selecciona una fórmula e ingresa una cantidad objetivo')
      return
    }

    const targetAmountNum = parseFloat(targetAmount)
    if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
      setError('La cantidad objetivo debe ser un número positivo')
      return
    }

    setLoading(true)
    setError('')
    try {
      const targetKgParam = encodeURIComponent(targetAmountNum.toString())
      const formulaParam = encodeURIComponent(selectedFormulaId)
      router.push(`/batches/new/result?formulaId=${formulaParam}&targetKg=${targetKgParam}`)
    } finally {
      setLoading(false)
    }
  }

  const selectedFormula = formulas.find((f) => f.id === selectedFormulaId)
  const selectionLocked = hasInitialFormula && selectedFormula
  const formatKgFromGrams = (grams: number) => `${gramsToKg(grams).toFixed(2)} kg`

  return (
    <div className="space-y-6">
      {/* Formula Selection */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">1. Seleccionar Fórmula</h2>
        {selectionLocked && (
          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-900">
            Fórmula preseleccionada desde el detalle. Puedes generar el lote directamente.
            <div className="mt-2">
              <Link
                href={`/colors/${selectedFormula.color.id}/formulas/${selectedFormula.id}`}
                className="inline-flex items-center rounded-lg border border-red-100 bg-white px-4 py-2 text-base font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800"
              >
                ← Volver a la fórmula
              </Link>
            </div>
          </div>
        )}
        <div className="mt-4">
          <select
            value={selectedFormulaId}
            onChange={(e) => {
              if (selectionLocked) return
              setSelectedFormulaId(e.target.value)
            }}
            disabled={Boolean(selectionLocked)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selecciona una fórmula...</option>
            {formulas
              .filter((f) => f.is_active)
              .map((formula) => (
                <option key={formula.id} value={formula.id}>
                  {formula.color.product.name} - {formula.color.name} (v{formula.version}) -{' '}
                  {formatKgFromGrams(formula.base_total_g)} base
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
                <span className="ml-2 text-gray-900">
                  {formatKgFromGrams(selectedFormula.base_total_g)}
                </span>
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
        <h2 className="text-2xl font-semibold text-gray-950">2. Cantidad Objetivo</h2>
        <div className="mt-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label htmlFor="targetAmount" className="block text-base font-semibold text-gray-800">
                Cantidad objetivo (kg)
              </label>
              <Input
                id="targetAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={targetAmount}
                onChange={(e) => {
                  setTargetAmount(e.target.value)
                }}
                placeholder="Ej: 200 o 35.5"
                className="mt-2"
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
    </div>
  )
}
