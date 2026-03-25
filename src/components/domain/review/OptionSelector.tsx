'use client'

import {
  AlignVerticalSpaceAround,
  ArrowRight,
  ArrowUpNarrowWide,
  Minus,
  Mountain,
  MoveHorizontal,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function OptionSelector({ onChange }: any) {
  const [slope, setSlope] = useState('완만')
  const [width, setWidth] = useState('넓음')
  const [stairs, setStairs] = useState('있음')

  useEffect(() => {
    onChange({ slope, width, stairs })
  }, [slope, width, stairs])

  const Option = ({
    icon,
    label,
    selected,
    onClick,
  }: {
    icon: React.ReactNode
    label: string
    selected: boolean
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl border w-full transition cursor-pointer
        ${selected ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}
      `}
    >
      <div className="text-gray-700">{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  )

  return (
    <div>
      <p className="text-sm mb-3 text-gray-600">경사도</p>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Option
          icon={<ArrowRight size={18} />}
          label="완만"
          selected={slope === '완만'}
          onClick={() => setSlope('완만')}
        />
        <Option
          icon={<TrendingUp size={18} />}
          label="보통"
          selected={slope === '보통'}
          onClick={() => setSlope('보통')}
        />
        <Option
          icon={<Mountain size={18} />}
          label="가파름"
          selected={slope === '가파름'}
          onClick={() => setSlope('가파름')}
        />
      </div>
      <div>
        <p className="text-sm mb-3 text-gray-600">인도 폭</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Option
            icon={<MoveHorizontal size={18} />}
            label="넓음"
            selected={width === '넓음'}
            onClick={() => setWidth('넓음')}
          />
          <Option
            icon={<AlignVerticalSpaceAround size={18} />}
            label="좁음"
            selected={width === '좁음'}
            onClick={() => setWidth('좁음')}
          />
        </div>
      </div>
      <div>
        <p className="text-sm mb-3 text-gray-600">계단 유무</p>
        <div className="grid grid-cols-2 gap-3">
          <Option
            icon={<ArrowUpNarrowWide size={18} />}
            label="있음"
            selected={stairs === '있음'}
            onClick={() => setStairs('있음')}
          />
          <Option
            icon={<Minus size={18} />}
            label="없음"
            selected={stairs === '없음'}
            onClick={() => setStairs('없음')}
          />
        </div>
      </div>
    </div>
  )
}
