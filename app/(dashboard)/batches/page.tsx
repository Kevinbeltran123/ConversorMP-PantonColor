import Link from 'next/link'
import { getBatches } from '@/application/use-cases/batches.actions'
import { Button } from '@/components/ui/button'
import { formatGrams, gramsToKg } from '@/lib/utils/units'

export default async function BatchesPage() {
  const { data: batches, error } = await getBatches()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/colors"
          className="inline-flex w-fit items-center rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-base font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800"
        >
          ← Volver a colores
        </Link>
        <h1 className="text-4xl font-semibold text-gray-950">Lotes</h1>
        <p className="text-base text-gray-600">Historial de lotes generados.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/batches/new">
          <Button className="px-4 py-2 text-base font-semibold">Generar Lote</Button>
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
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Lote
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Producto / Color
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Objetivo
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Factor
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold uppercase tracking-wider text-gray-600">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {batches.map((batch) => {
                const product = batch.formula?.color?.product?.name ?? '—'
                const color = batch.formula?.color?.name ?? '—'
                const targetKg = `${gramsToKg(batch.target_total_g).toFixed(2)} kg`

                return (
                  <tr key={batch.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      #{batch.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="font-semibold text-gray-900">
                        {product} · {color}
                      </div>
                      <div className="text-xs text-gray-500">
                        Fórmula v{batch.formula?.version ?? '—'} · Base{' '}
                        {batch.formula ? formatGrams(batch.formula.base_total_g) : '—'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {targetKg}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700">
                      {batch.scale_factor.toFixed(4)}x
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {new Date(batch.created_at).toLocaleString('es-MX')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link href={`/batches/${batch.id}`}>
                        <Button variant="secondary" className="px-4 py-2 text-base font-semibold">
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

