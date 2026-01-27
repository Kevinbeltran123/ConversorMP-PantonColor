import Link from 'next/link'
import { getBatches } from '@/application/use-cases/batches.actions'
import { Button } from '@/components/ui/button'
import { formatGrams, gramsToKg } from '@/lib/utils/units'

export default async function BatchesPage() {
  const { data: batches, error } = await getBatches()

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <Link
          href="/colors"
          className="inline-flex w-fit items-center rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800 sm:px-4 sm:py-2 sm:text-base"
        >
          ← Volver a colores
        </Link>
        <h1 className="text-2xl font-semibold text-gray-950 sm:text-3xl lg:text-4xl">Lotes</h1>
        <p className="text-sm text-gray-600 sm:text-base">Historial de lotes generados.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/batches/new" className="w-full sm:w-auto">
          <Button className="w-full px-4 py-2 text-base font-semibold sm:w-auto">
            Generar Lote
          </Button>
        </Link>
      </div>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      {!batches || batches.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-base text-gray-700">Aún no hay lotes guardados.</p>
          <p className="mt-1 text-sm text-gray-500">
            Genera tu primer lote desde una fórmula activa.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  Lote
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  Producto / Color
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  Objetivo
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  Factor
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  Fecha
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 sm:px-6 sm:py-3 sm:text-sm">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {batches.map((batch) => {
                const formulaData = Array.isArray(batch.formula) ? batch.formula[0] : batch.formula
                const colorData = Array.isArray(formulaData?.color)
                  ? formulaData?.color?.[0]
                  : formulaData?.color
                const product = colorData?.product?.name ?? '—'
                const color = colorData?.name ?? '—'
                const targetKg = `${gramsToKg(batch.target_total_g).toFixed(2)} kg`

                return (
                  <tr key={batch.id}>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                      #{batch.id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm">
                      <div className="font-semibold text-gray-900">
                        {product} · {color}
                      </div>
                      <div className="text-[10px] text-gray-500 sm:text-xs">
                        Fórmula v{formulaData?.version ?? '—'} · Base{' '}
                        {formulaData ? formatGrams(formulaData.base_total_g) : '—'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-xs font-semibold text-gray-900 sm:px-6 sm:py-4 sm:text-sm">
                      {targetKg}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm">
                      {batch.scale_factor.toFixed(4)}x
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm">
                      {new Date(batch.created_at).toLocaleString('es-MX')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right sm:px-6 sm:py-4">
                      <Link href={`/batches/${batch.id}`}>
                        <Button
                          variant="secondary"
                          className="px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-base"
                        >
                          Ver
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
