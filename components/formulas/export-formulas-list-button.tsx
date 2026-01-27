'use client'

import { Button } from '@/components/ui/button'
import { exportFormulasListToCSV } from '@/lib/utils/csv-export'

interface ExportFormulasListButtonProps {
  formulas: Array<{
    id: string
    product_name: string
    color_name: string
    version: number
    base_total_g: number
    is_active: boolean
    items_count: number
    created_at: string
  }>
}

export function ExportFormulasListButton({ formulas }: ExportFormulasListButtonProps) {
  const handleExport = () => {
    if (formulas.length === 0) {
      alert('No hay fórmulas para exportar')
      return
    }
    exportFormulasListToCSV(formulas)
  }

  return (
    <Button variant="secondary" onClick={handleExport}>
      📊 Exportar CSV
    </Button>
  )
}
