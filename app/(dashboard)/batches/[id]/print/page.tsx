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

  const formulaData = Array.isArray(batch.formula) ? batch.formula[0] : batch.formula
  const colorData = Array.isArray(formulaData?.color) ? formulaData?.color?.[0] : formulaData?.color
  const productData = Array.isArray(colorData?.product) ? colorData?.product?.[0] : colorData?.product
  const totalScaled = batch.items.reduce((sum, item) => sum + item.quantity_g, 0)

  const fallbackProduct = {
    id: '',
    name: '',
    description: null,
    active: true,
    created_at: '',
    updated_at: '',
    created_by: null,
    updated_by: null,
  }

  const fallbackColor = {
    id: '',
    product_id: '',
    name: '',
    notes: null,
    image_url: null,
    active: true,
    created_at: '',
    updated_at: '',
    created_by: null,
    updated_by: null,
    product: fallbackProduct,
  }

  const normalizedColor = colorData
    ? { ...colorData, product: productData ?? fallbackProduct }
    : fallbackColor

  const printFormula = {
    id: formulaData?.id ?? '',
    version: formulaData?.version ?? 0,
    base_total_g: formulaData?.base_total_g ?? 0,
    is_active: formulaData?.is_active ?? false,
    notes: formulaData?.notes ?? null,
    color: normalizedColor,
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
