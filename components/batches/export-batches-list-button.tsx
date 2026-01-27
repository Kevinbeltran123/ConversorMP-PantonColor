'use client'

import { Button } from '@/components/ui/button'
import { exportBatchesListToCSV } from '@/lib/utils/csv-export'

interface ExportBatchesListButtonProps {
  batches: Array<{
    id: string
    product_name: string
    color_name: string
    formula_version: number
    target_total_g: number
    scale_factor: number
    items_count: number
    created_at: string
    created_by: string | null
  }>
}

export function ExportBatchesListButton({ batches }: ExportBatchesListButtonProps) {
  const handleExport = () => {
    if (batches.length === 0) {
      alert('No hay lotes para exportar')
      return
    }
    exportBatchesListToCSV(batches)
  }

  return (
    <Button variant="secondary" onClick={handleExport}>
      📊 Exportar CSV
    </Button>
  )
}
