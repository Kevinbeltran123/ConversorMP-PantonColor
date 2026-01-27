'use client'

import { formatQuantity } from '@/lib/utils/scaling'
import type { Product, Color } from '@/domain/entities/database.types'

interface PrintFormula {
  id: string
  version: number
  base_total_g: number
  is_active: boolean
  notes: string | null
  color: Color & { product: Product }
}

interface PrintCalculation {
  scaleFactor: number;
  targetTotal: number;
  actualTotal: number;
  roundingDifference: number;
  items: {
    ingredientId: string
    ingredientName: string
    scaledQuantity: number
    position: number
  }[]
}

interface BatchPrintOrderProps {
  formula: PrintFormula
  calculation: PrintCalculation
  batchId?: string
  observations?: string
  createdAt?: Date
  operatorEmail: string
}

export function BatchPrintOrder({
  formula,
  calculation,
  observations,
  createdAt,
}: BatchPrintOrderProps) {
  const currentDate = createdAt || new Date()

  return (
    <div className="print-container mx-auto w-full max-w-3xl bg-white p-4 text-black">
      <div className="mb-4 flex items-end justify-between border-b border-black pb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            Orden de mezcla
          </p>
          <h1 className="mt-1 text-3xl font-bold">{formula.color?.name || 'N/A'}</h1>
        </div>
        <p className="text-xs text-gray-700">
          {currentDate.toLocaleDateString('es-MX')} {currentDate.toLocaleTimeString('es-MX')}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-lg font-bold">Ingredientes</h2>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th className="border border-black px-3 py-2 text-left font-semibold">Ingrediente</th>
              <th className="border border-black px-3 py-2 text-right font-semibold">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {calculation.items.map((item, index) => (
              <tr key={item.ingredientId}>
                <td className="border border-black px-3 py-2 font-medium">
                  {index + 1}. {item.ingredientName}
                </td>
                <td className="border border-black px-3 py-2 text-right font-semibold">
                  {formatQuantity(item.scaledQuantity)}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="border border-black px-3 py-2 text-right">TOTAL</td>
              <td className="border border-black px-3 py-2 text-right">
                {formatQuantity(calculation.actualTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {observations && (
        <div className="mt-4 border border-black p-3">
          <h3 className="mb-1 text-base font-bold">Nota</h3>
          <div className="whitespace-pre-wrap text-sm leading-5">
            {observations}
          </div>
        </div>
      )}
    </div>
  )
}
