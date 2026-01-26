'use client'

import { useState } from 'react'
import { Input } from './input'

interface SearchInputProps {
  placeholder?: string
  defaultValue?: string
  onSearch: (value: string) => void
  debounceMs?: number
}

export function SearchInput({
  placeholder = 'Buscar...',
  defaultValue = '',
  onSearch,
  debounceMs = 300,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // Debounce search
    setTimeout(() => {
      onSearch(newValue)
    }, debounceMs)
  }

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className="max-w-sm"
    />
  )
}
