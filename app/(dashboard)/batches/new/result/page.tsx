import Link from 'next/link'
import { redirect } from 'next/navigation'
import { calculateBatch } from '@/application/use-cases/batches.actions'
import { getFormulaById } from '@/application/use-cases/formulas.actions'
import { BatchResult } from '@/components/batches/batch-result'
import { kgToGrams } from '@/lib/utils/units'

export default async function BatchResultPage({
  searchParams,
}: {
  searchParams: Promise<{ formulaId?: string; targetKg?: string }>
}) {
  const params = await searchParams
  const formulaId = params.formulaId
  const targetKgRaw = params.targetKg

  if (!formulaId || !targetKgRaw) {
    redirect('/batches/new')
  }

  const targetKg = Number(targetKgRaw)
  if (!Number.isFinite(targetKg) || targetKg <= 0) {
    redirect(`/batches/new?formulaId=${encodeURIComponent(formulaId)}`)
  }

  const [formulaResult, calculationResult] = await Promise.all([
    getFormulaById(formulaId),
    calculateBatch({
      formula_id: formulaId,
      target_total_g: kgToGrams(targetKg),
    }),
  ])

  if (formulaResult.error || !formulaResult.data || calculationResult.error || !calculationResult.data) {
    return (
      <div className="space-y-4">
        <Link
          href={`/batches/new?formulaId=${encodeURIComponent(formulaId)}`}
          className="inline-flex w-fit items-center rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-base font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800"
        >
          ← Volver
        </Link>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          No se pudo calcular el lote. Verifica la fórmula y la cantidad objetivo.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/batches/new?formulaId=${encodeURIComponent(formulaId)}`}
          className="inline-flex w-fit items-center rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-base font-semibold text-red-700 transition-colors hover:bg-red-100 hover:text-red-800"
        >
          ← Volver a cantidad objetivo
        </Link>
        <h1 className="text-4xl font-semibold text-gray-950">Resultado del Lote</h1>
        <p className="text-base text-gray-600">
          Revisa los ingredientes escalados y guarda el lote cuando esté correcto.
        </p>
      </div>

      <BatchResult
        formula={formulaResult.data}
        calculation={calculationResult.data}
        targetKg={targetKg}
      />
    </div>
  )
}

