'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

/** 
 * CommonButton 컴포넌트의 속성(Props) 정의
 * <HTMLButtonElement>기본적인 HTML button 태그의 속성(onClick, disabled 등)을 상속받는 제네릭 타입입니다.
 */
interface CommonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode // 버튼 내부에 들어갈 내용 (텍스트, 아이콘 등)
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' // 버튼의 시각적 테마 선택
}

/**
 * 앱 전역에서 일관된 디자인 시스템을 유지하기 위해 사용하는 공통 버튼 컴포넌트입니다.
 * 
 * @param children - 버튼 내부에 렌더링될 내용
 * @param variant - 버튼의 스타일 타입 (primary: 메인, secondary: 보조, outline: 테두리, danger: 위험)
 * @param className - 컴포넌트 외부에서 추가로 스타일을 덮어쓰거나 여백을 줄 때 사용
 * @param props - onClick, disabled, type 등 표준 버튼 속성들
 */
export default function CommonButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: CommonButtonProps) {
  
  // 1. 모든 버튼에 공통으로 적용되는 기본 스타일 (Base CSS)
  // - 인라인-플렉스로 중앙 정렬, 라운드(full), 부드러운 색상 전환(transition) 포함
  const baseStyle =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  // 2. 각 변형(Variant)별 색상 및 배경 스타일 정의
  const variants = {
    // 브랜드 메인 컬러 (보라색 강조)
    primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm',
    // 눈에 띄지 않는 보조 버튼 (회색 테마)
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    // 배경 없이 테두리만 있는 스타일 (흰색 배경)
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white',
    // 삭제나 탈퇴 등 위험한 동작용 (빨간색 테마)
    danger: 'text-red-600 bg-red-50 hover:bg-red-100',
  }

  return (
    <button
      // 템플릿 리터럴을 사용해 기본 스타일 + 선택된 테마 스타일 + 외부 주입 스타일을 조합
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
