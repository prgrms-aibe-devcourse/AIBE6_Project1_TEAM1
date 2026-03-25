// common 폴더에 있는 필터뱃지로 교체해야함

'use client'

import { ReactNode } from 'react'

interface FilterBadgeProps {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}

export default function FilterBadge({
  children,
  selected = false,
  onClick,
  className = '',
}: FilterBadgeProps) {
  const baseStyle =
    'inline-flex items-center px-3 py-1 text-sm rounded-full transition-colors cursor-pointer border'

  const selectedStyle = selected
    ? 'bg-purple-100 text-purple-800 border-purple-200 font-medium'
    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${baseStyle} ${selectedStyle} ${className}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {children}
    </div>
  )
}
