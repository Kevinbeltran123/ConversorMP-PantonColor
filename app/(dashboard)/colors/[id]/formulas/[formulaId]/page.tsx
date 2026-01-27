import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFormulaById } from '@/application/use-cases/formulas.actions'
import { ExportFormulaButton } from '@/components/formulas/export-formula-button'
import { formatGrams } from '@/lib/utils/units'
import { Button } from '@/components/ui/button'

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
    <div className="space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href={`/colors/${colorId}`}
              className="inline-flex items-center rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-base font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800"
            >
              ← Volver a {color.name}
            </Link>
            <p className="mt-5 text-lg font-semibold tracking-wide text-red-600">
              Fórmula
            </p>
            <h1 className="mt-1 text-4xl font-semibold text-gray-950">
              Versión {formula.version}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {product.name} - {color.name}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <ExportFormulaButton
              formula={{
                ...formula,
                product,
                color,
              }}
            />
            <Link
              href={`/batches/new?formulaId=${formulaId}`}
              className="w-full sm:w-auto"
            >
              <Button className="w-full px-4 py-2 text-base font-semibold sm:w-auto">
                Generar Lote
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Formula Info */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-medium text-gray-500">Cantidad base</p>
          <p className="mt-2 text-3xl font-semibold text-gray-950">
            {formatGrams(formula.base_total_g)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-medium text-gray-500">Ingredientes</p>
          <p className="mt-2 text-3xl font-semibold text-gray-950">{formula.items.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {new Date(formula.created_at).toLocaleString('es-MX')}
          </p>
        </div>

        {formula.notes && (
          <div className="md:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <p className="text-sm font-medium text-gray-500">Notas</p>
            <p className="mt-2 text-sm leading-6 text-gray-700">{formula.notes}</p>
          </div>
        )}
      </section>

      {/* Ingredients Table */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-950">Ingredientes</h2>
            <p className="mt-1 text-sm text-gray-600">
              Orden sugerido para preparar la mezcla.
            </p>
          </div>
          <p className="text-sm font-medium text-gray-600">{formula.items.length} en total</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  #
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Ingrediente
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold uppercase tracking-wider text-gray-600">
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
      </section>
    </div>
  )
}
