import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFormulaById } from '@/application/use-cases/formulas.actions'
import { ExportFormulaButton } from '@/components/formulas/export-formula-button'
import { formatGrams } from '@/lib/utils/units'
import { SimpleBatchCalculator } from '@/components/batches/simple-batch-calculator'

export default async function FormulaDetailPage({
  params,
}: {
  params: Promise<{ id: string; formulaId: string }>
}) {
  const { id: colorId, formulaId } = await params
  const { data: formula, error } = await getFormulaById(formulaId)

  if (error || !formula) {
    notFound()
  }

  const color = formula.color
  const product = color.product

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/colors/${colorId}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Volver a {color.name}
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Fórmula Versión {formula.version}
          </h1>
          <p className="mt-1 text-gray-600">
            {product.name} - {color.name}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportFormulaButton
            formula={{
              ...formula,
              product: product,
              color: color,
            }}
          />
          {formula.is_active && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              Activa
            </span>
          )}
        </div>
      </div>

      {/* Formula Info */}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-white p-6 shadow">
        <div>
          <p className="text-sm font-medium text-gray-700">Cantidad Base</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {formatGrams(formula.base_total_g)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Ingredientes</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formula.items.length}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-700">Fecha de Creación</p>
          <p className="mt-1 text-sm text-gray-900">
            {new Date(formula.created_at).toLocaleString('es-MX')}
          </p>
        </div>
        {formula.notes && (
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-700">Notas</p>
            <p className="mt-1 text-sm text-gray-600">{formula.notes}</p>
          </div>
        )}
      </div>

      {/* Ingredients Table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Ingredientes</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ingrediente
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {formula.items.map((item, index) => {
                const percentage = ((item.quantity_g / formula.base_total_g) * 100).toFixed(2)
                return (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.ingredient.name}
                      {item.ingredient.description && (
                        <p className="mt-1 text-xs text-gray-500">{item.ingredient.description}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                      {formatGrams(item.quantity_g)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                      {percentage}%
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-gray-50">
                <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                  {formatGrams(formula.items.reduce((sum, item) => sum + item.quantity_g, 0))}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-500">
                  100.00%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Calculator */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Generar Lote</h2>
        <SimpleBatchCalculator formulaId={formulaId} colorId={colorId} />
      </div>
    </div>
  )
}
