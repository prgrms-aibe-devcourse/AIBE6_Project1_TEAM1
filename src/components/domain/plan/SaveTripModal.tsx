'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SaveTripModalProps {
  onClose: () => void
  onSave: (
    title: string,
    startDate: string,
    endDate: string,
    isPublic: boolean,
  ) => Promise<void>
  totalDays: number // 자동으로 종료일을 계산하기 위해 추가
  initialData?: {   // 기존 정보를 불러올 때 초기값 세팅용
    title: string
    startDate: string
    endDate: string
    isPublic: boolean
  }
}

export default function SaveTripModal({ onClose, onSave, totalDays, initialData }: SaveTripModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  // 날짜를 YYYY-MM-DD 형태로 기본값 세팅
  const [startDate, setStartDate] = useState(() => initialData?.startDate || new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(() => initialData?.endDate || new Date().toISOString().split('T')[0])
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 시작일이 바뀌거나 총 일수(Day 탭 개수)가 바뀌면 자동으로 종료일을 계산합니다.
  useEffect(() => {
    if (!startDate || totalDays < 1) return;
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (totalDays - 1));
    
    setEndDate(end.toISOString().split('T')[0]);
  }, [startDate, totalDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 최소한의 방어 로직 (빈 제목 막기)
    if (!title.trim()) {
      alert('여행 제목을 입력해주세요.')
      return
    }
    
    // 시작일/종료일 검증
    if (new Date(startDate) > new Date(endDate)) {
      alert('종료일은 시작일보다 빠를 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    try {
      // 부모 컴포넌트(Page)가 넘겨준 실제 DB 저장 함수 호출
      await onSave(title, startDate, endDate, isPublic)
      onClose() // 저장이 완전히 성공하면 모달 닫기
    } catch (error) {
      console.error(error)
      // 에러 처리는 부모 함수에서 이미 alert를 띄워주니 굳이 추가하지 않아도 됨
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    // 배경을 불투명하게 만들고 컴포넌트를 띄웁니다.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">여행 상세 정보 저장</h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 정보 입력 Form 범위 */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6 bg-gray-50/50">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-[13px] font-bold text-gray-700">
              어떤 여행을 만들어볼까요? <span className="text-purple-600">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 우리들의 완벽한 제주 여행"
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[14px] text-gray-900 shadow-sm transition-all"
              autoFocus
            />
          </div>

          <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="startDate" className="text-[13px] font-bold text-gray-700">가는 날</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[14px] text-gray-900 shadow-sm transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="endDate" className="text-[13px] font-bold text-gray-700">오는 날</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate} // 최소 시작날짜와 맞춰줌
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-[14px] text-gray-900 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-gray-900">내 일정 공개하기</span>
              <span className="text-[12px] text-gray-400 mt-0.5">다른 유저들이 내 일정을 참고할 수 있게 허용합니다.</span>
            </div>
            {/* 토글 스위치 형태의 체크박스 구현 */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* 하단 완료/강제 버튼들 */}
          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 text-[14px] font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-[14px] font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center justify-center min-w-[110px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "저장 완료"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
