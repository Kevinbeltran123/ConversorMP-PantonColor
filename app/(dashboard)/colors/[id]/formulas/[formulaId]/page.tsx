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
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)] sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href={`/colors/${colorId}`}
              className="inline-flex items-center rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800 sm:px-4 sm:py-2 sm:text-base"
            >
              ← Volver a {color.name}
            </Link>
            <p className="mt-4 text-base font-semibold tracking-wide text-red-600 sm:mt-5 sm:text-lg">
              Fórmula
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-950 sm:text-3xl lg:text-4xl">
              Versión {formula.version}
            </h1>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
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
      <section className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-6">
          <p className="text-xs font-medium text-gray-500 sm:text-sm">Cantidad base</p>
          <p className="mt-2 text-2xl font-semibold text-gray-950 sm:text-3xl">
            {formatGrams(formula.base_total_g)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-6">
          <p className="text-xs font-medium text-gray-500 sm:text-sm">Ingredientes</p>
          <p className="mt-2 text-2xl font-semibold text-gray-950 sm:text-3xl">
            {formula.items.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-6">
          <p className="text-xs font-medium text-gray-500 sm:text-sm">Fecha de creación</p>
          <p className="mt-2 text-xs font-medium text-gray-900 sm:text-sm">
            {new Date(formula.created_at).toLocaleString('es-MX')}
          </p>
        </div>

        {formula.notes && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-6 md:col-span-3">
            <p className="text-xs font-medium text-gray-500 sm:text-sm">Notas</p>
            <p className="mt-2 text-sm leading-6 text-gray-700">{formula.notes}</p>
          </div>
        )}
      </section>

      {/* Ingredients Table */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold text-gray-950 sm:text-2xl lg:text-3xl">
              Ingredientes
            </h2>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Orden sugerido para preparar la mezcla.
            </p>
          </div>
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            {formula.items.length} en total
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  Ingrediente
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  Cantidad
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {formula.items.map((item, index) => {
                const percentage = ((item.quantity_g / formula.base_total_g) * 100).toFixed(2)
                return (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                      {item.ingredient.name}
                      {item.ingredient.description && (
                        <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                          {item.ingredient.description}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-xs text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                      {formatGrams(item.quantity_g)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm">
                      {percentage}%
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-gray-50">
                <td colSpan={2} className="px-3 py-3 text-xs font-bold text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                  Total
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-xs font-bold text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                  {formatGrams(formula.items.reduce((sum, item) => sum + item.quantity_g, 0))}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-xs font-medium text-gray-500 sm:px-6 sm:py-4 sm:text-sm">
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
