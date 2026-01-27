import Link from 'next/link'
import { getFormulas } from '@/application/use-cases/formulas.actions'
import { BatchCalculator } from '@/components/batches/batch-calculator'

export default async function NewBatchPage({
  searchParams,
}: {
  searchParams: Promise<{ formulaId?: string }>
}) {
  const params = await searchParams
  const formulaIdFromUrl = params.formulaId

  const { data: formulas, error } = await getFormulas()

  const initialFormulaId = formulaIdFromUrl
    ? formulas?.find((formula) => formula.id === formulaIdFromUrl && formula.is_active)?.id
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/colors"
          className="inline-flex w-fit items-center rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-base font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800"
        >
          ← Volver a colores
        </Link>
        <h1 className="text-4xl font-semibold text-gray-950">Generar Lote</h1>
        <p className="text-base text-gray-600">
          Selecciona una fórmula activa, ingresa la cantidad objetivo en kilogramos y guarda el lote.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}

      {!formulas || formulas.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-sm text-gray-600">No hay fórmulas disponibles.</p>
        </div>
      ) : (
        <BatchCalculator formulas={formulas} initialFormulaId={initialFormulaId} />
      )}
    </div>
  )
}
