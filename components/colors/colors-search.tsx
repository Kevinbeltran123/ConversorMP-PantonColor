'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/components/ui/search-input'

interface ColorsSearchProps {
  defaultValue?: string
}

export function ColorsSearch({ defaultValue = '' }: ColorsSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value.trim()) {
        params.set('search', value.trim())
      } else {
        params.delete('search')
      }

      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    },
    [pathname, router, searchParams]
  )

  return (
    <SearchInput
      placeholder="Ingresa el nombre del color que quieres buscar"
      defaultValue={defaultValue}
      onSearch={handleSearch}
    />
  )
}
