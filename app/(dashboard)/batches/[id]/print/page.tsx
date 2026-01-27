import { notFound } from 'next/navigation'
import { getBatchById } from '@/application/use-cases/batches.actions'
import { BatchPrintOrder } from '@/components/batches/batch-print-order'
import { AutoPrint } from '@/components/batches/auto-print'
import { createClient } from '@/infrastructure/supabase/server'

export default async function BatchPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: batch, error } = await getBatchById(id)

  if (error || !batch) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const formula = batch.formula
  const totalScaled = batch.items.reduce((sum, item) => sum + item.quantity_g, 0)

  const printFormula = {
    ...formula,
    product: formula.color.product,
    color: formula.color,
  }

  const printCalculation = {
    scaleFactor: batch.scale_factor,
    targetTotal: batch.target_total_g,
    actualTotal: totalScaled,
    roundingDifference: 0,
    items: batch.items.map((item, index) => ({
      ingredientId: item.ingredient_id,
      ingredientName: item.ingredient_name,
      scaledQuantity: item.quantity_g,
      position: item.position ?? index,
    })),
  }

  return (
    <div>
      <AutoPrint backHref="/colors" />
      <BatchPrintOrder
        formula={printFormula}
        calculation={printCalculation}
        batchId={batch.id}
        observations={batch.observations ?? undefined}
        createdAt={new Date(batch.created_at)}
        operatorEmail={user?.email ?? ''}
      />
    </div>
  )
}
