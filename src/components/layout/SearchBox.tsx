'use client'

import { Search } from 'lucide-react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { useState } from 'react'

interface SearchBoxProps {
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
}

export default function SearchBox({
  value,
  onChange,
  onKeyDown,
  placeholder = '어디로 떠나볼까요?',
}: SearchBoxProps) {
  const [internalValue, setInternalValue] = useState('')

  const isControlled = value !== undefined
  const inputValue = isControlled ? value : internalValue

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    onChange?.(e)
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full bg-gray-100/80 rounded-full py-2.5 pl-11 pr-4 text-sm text-black focus:outline-none focus:ring-2 focus:ring-gray-200"
      />
    </div>
  )
}
