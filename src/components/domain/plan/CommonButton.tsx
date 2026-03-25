// common 폴더에 있는 버튼으로 교체해야함

'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface CommonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
}

export default function CommonButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: CommonButtonProps) {
  const baseStyle =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white',
    danger: 'text-red-600 bg-red-50 hover:bg-red-100',
  }

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
