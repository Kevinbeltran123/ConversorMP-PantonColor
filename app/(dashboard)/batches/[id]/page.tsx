import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBatchById } from '@/application/use-cases/batches.actions'
import { PrintButton, BackButton } from '@/components/batches/print-button'
import { ExportBatchButton } from '@/components/batches/export-batch-button'
import { formatGrams } from '@/lib/utils/units'
import { formatQuantity } from '@/lib/utils/scaling'

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: batch, error } = await getBatchById(id)

  if (error || !batch) {
    notFound()
  }

  const formula = batch.formula
  const color = formula.color
  const product = color.product

  const totalScaled = batch.items.reduce((sum, item) => sum + item.quantity_g, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lote #{batch.id.slice(0, 8)}</h1>
          <p className="mt-1 text-gray-600">
            {product.name} - {color.name}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Creado el {new Date(batch.created_at).toLocaleString('es-MX')}
            {batch.created_by && ` por ${batch.created_by}`}
          </p>
        </div>
        <div className="flex gap-3">
          <BackButton />
          <ExportBatchButton batch={batch} />
          <PrintButton batchId={batch.id} />
        </div>
      </div>

      {/* Batch Info */}
      <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-6 shadow md:grid-cols-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Producto</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{product.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Color</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{color.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Fórmula</p>
          <Link
            href={`/colors/${color.id}/formulas/${formula.id}`}
            className="mt-1 inline-block text-lg font-semibold text-blue-600 hover:text-blue-800"
          >
            Versión {formula.version}
          </Link>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Cantidad Base</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatGrams(formula.base_total_g)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Cantidad Objetivo</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {formatGrams(batch.target_total_g)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Factor de Escala</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {batch.scale_factor.toFixed(4)}x
          </p>
        </div>
        {batch.observations && (
          <div className="col-span-1 md:col-span-3">
            <p className="text-sm font-medium text-gray-700">Observaciones</p>
            <p className="mt-1 text-sm text-gray-600">{batch.observations}</p>
          </div>
        )}
      </div>

      {/* Ingredients Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-900">Ingredientes Escalados</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {batch.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.ingredient_name}
                    {item.ingredient?.description && (
                      <p className="mt-1 text-xs text-gray-500">{item.ingredient.description}</p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {formatQuantity(item.quantity_g)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900">
                  Total
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                  {formatQuantity(totalScaled)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Link back to color */}
      <div className="text-center">
        <Link
          href={`/colors/${color.id}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Volver a {color.name}
        </Link>
      </div>
    </div>
  )
}
