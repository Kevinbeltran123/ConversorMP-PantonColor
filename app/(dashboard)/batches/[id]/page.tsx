import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getBatchById } from '@/application/use-cases/batches.actions'
import { Button } from '@/components/ui/button'
import {
  formatRoundingDifference,
  getRoundingStatusColor,
  calculateRoundingDifference,
  isRoundingAcceptable,
} from '@/lib/utils/scaling'

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: batch, error } = await getBatchById(id)

  if (error || !batch) {
    redirect('/batches')
  }

  const formula = Array.isArray(batch.formula) ? batch.formula[0] : batch.formula
  const color = formula?.color ? (Array.isArray(formula.color) ? formula.color[0] : formula.color) : null
  const product = color?.product ? (Array.isArray(color.product) ? color.product[0] : color.product) : null

  // Calculate totals and rounding difference
  const totalScaled = batch.items.reduce((sum, item) => sum + item.quantity_g, 0)
  const roundingDiff = calculateRoundingDifference(batch.target_total_g, totalScaled)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/batches" className="text-sm text-blue-600 hover:text-blue-800">
          ← Volver a Lotes
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Detalle del Lote</h1>
        <p className="mt-2 text-gray-600">
          Creado el{' '}
          {new Date(batch.created_at).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Formula Information */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Información de la Fórmula</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Producto</p>
            <p className="mt-1 text-base text-gray-900">{product?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Color</p>
            <p className="mt-1 text-base text-gray-900">{color?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Versión de Fórmula</p>
            <p className="mt-1 text-base text-gray-900">v{formula?.version}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            {formula?.is_active ? (
              <span className="mt-1 inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Activa
              </span>
            ) : (
              <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                Inactiva
              </span>
            )}
          </div>
        </div>
        {formula?.notes && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Notas de la Fórmula</p>
            <p className="mt-1 text-sm text-gray-600">{formula.notes}</p>
          </div>
        )}
      </div>

      {/* Scaling Summary */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Resumen de Escalado</h2>
        <div className="mt-4 grid grid-cols-3 gap-6">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">Cantidad Base</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formula?.base_total_g.toLocaleString()}g
            </p>
          </div>
          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm font-medium text-gray-700">Cantidad Objetivo</p>
            <p className="mt-2 text-2xl font-bold text-blue-900">
              {batch.target_total_g.toLocaleString()}g
            </p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">Factor de Escalado</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {batch.scale_factor.toFixed(4)}x
            </p>
          </div>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Ingredientes del Lote</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ingrediente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {batch.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.ingredient_name}</div>
                    {item.ingredient && item.ingredient.description && (
                      <div className="text-sm text-gray-500">{item.ingredient.description}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-lg font-semibold text-gray-900">
                    {item.quantity_g.toLocaleString()}g
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">Total</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-xl font-bold text-gray-900">
                  {totalScaled.toLocaleString()}g
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rounding Information */}
      <div className="mb-6 rounded-lg bg-blue-50 p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Diferencia por Redondeo</h3>
            <p className="mt-1 text-sm text-gray-600">
              Diferencia entre el objetivo y la suma de ingredientes redondeados
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-3xl font-bold ${getRoundingStatusColor(roundingDiff, batch.target_total_g)}`}
            >
              {formatRoundingDifference(roundingDiff)}
            </p>
            {!isRoundingAcceptable(roundingDiff, batch.target_total_g) && (
              <p className="mt-2 text-xs font-medium text-red-600">
                ⚠️ Diferencia mayor al 1%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Observations */}
      {batch.observations && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Observaciones</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">{batch.observations}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link href="/batches">
          <Button variant="secondary">Volver al Listado</Button>
        </Link>
        <Link href="/batches/new">
          <Button>Calcular Nuevo Lote</Button>
        </Link>
      </div>
    </div>
  )
}
