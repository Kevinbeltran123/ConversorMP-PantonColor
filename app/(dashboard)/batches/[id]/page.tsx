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

  const formulaData = Array.isArray(batch.formula) ? batch.formula[0] : batch.formula
  const colorData = Array.isArray(formulaData?.color) ? formulaData?.color?.[0] : formulaData?.color
  const product = colorData?.product

  const totalScaled = batch.items.reduce((sum, item) => sum + item.quantity_g, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            Lote #{batch.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {product?.name ?? '—'} - {colorData?.name ?? '—'}
          </p>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Creado el {new Date(batch.created_at).toLocaleString('es-MX')}
            {batch.created_by && ` por ${batch.created_by}`}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:gap-3">
          <BackButton />
          <ExportBatchButton batch={batch} />
          <PrintButton batchId={batch.id} />
        </div>
      </div>

      {/* Batch Info */}
      <div className="grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow sm:gap-4 sm:p-6 md:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-gray-700 sm:text-sm">Producto</p>
          <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
            {product?.name ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 sm:text-sm">Color</p>
          <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
            {colorData?.name ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 sm:text-sm">Fórmula</p>
          <Link
            href={`/colors/${colorData?.id ?? ''}/formulas/${formulaData?.id ?? ''}`}
            className="mt-1 inline-block text-base font-semibold text-blue-600 hover:text-blue-800 sm:text-lg"
          >
            Versión {formulaData?.version ?? '—'}
          </Link>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 sm:text-sm">Cantidad Base</p>
          <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
            {formulaData ? formatGrams(formulaData.base_total_g) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 sm:text-sm">Cantidad Objetivo</p>
          <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
            {formatGrams(batch.target_total_g)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 sm:text-sm">Factor de Escala</p>
          <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
            {batch.scale_factor.toFixed(4)}x
          </p>
        </div>
        {batch.observations && (
          <div className="col-span-1 md:col-span-3">
            <p className="text-xs font-medium text-gray-700 sm:text-sm">Observaciones</p>
            <p className="mt-1 text-sm text-gray-600">{batch.observations}</p>
          </div>
        )}
      </div>

      {/* Ingredients Table */}
      <div className="rounded-lg bg-white p-4 shadow sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Ingredientes Escalados</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-6 sm:py-3 sm:text-xs">
                  #
                </th>
                <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-6 sm:py-3 sm:text-xs">
                  Ingrediente
                </th>
                <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:px-6 sm:py-3 sm:text-xs">
                  Cantidad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {batch.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm">
                    {index + 1}
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                    {item.ingredient_name}
                    {item.ingredient?.description && (
                      <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                        {item.ingredient.description}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                    {formatQuantity(item.quantity_g)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={2} className="px-3 py-3 text-xs font-bold text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                  Total
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-xs font-bold text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
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
          href={`/colors/${colorData?.id ?? ''}`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ← Volver a {colorData?.name ?? 'color'}
        </Link>
      </div>
    </div>
  )
}
