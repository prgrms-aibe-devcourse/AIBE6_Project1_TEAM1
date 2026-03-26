'use client'

import { createClient } from '@/utils/supabase/client'
import { Calendar as CalendarIcon, Globe, Lock, Map, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MyTripsSidebarProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  currentTripId?: string | null
  onSelectTrip: (tripId: string) => void
}

export default function MyTripsSidebar({
  isOpen,
  onClose,
  userId,
  currentTripId,
  onSelectTrip,
}: MyTripsSidebarProps) {
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 사이드바가 열릴 때마다 사용자의 여행 목록을 DB에서 최신화하여 불러옵니다.
  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchTrips = async () => {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: false }) // 최신순 정렬

      if (!error && data) {
        setTrips(data)
      }
      setIsLoading(false)
    }

    fetchTrips()
  }, [isOpen, userId])

  return (
    <>
      {/* 딤(Dim) 배경 오버레이: 바깥쪽 클릭 시 사이드바 닫힘 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[150] transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* 왼쪽에서 튀어나오는 Drawer 본체 애니메이션 */}
      <div
        className={`fixed top-0 left-0 h-full w-[340px] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-[160] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-gray-900 text-[16px] flex items-center gap-2">
            <Map className="w-5 h-5 text-purple-600" /> 내 보관함
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 내 일정 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#fafafa]">
          
          <button 
            onClick={() => onSelectTrip('new')}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-[13px] shadow-sm hover:bg-gray-800 transition-colors mb-2"
          >
            <Plus className="w-4 h-4" /> 새로운 일정 시작하기
          </button>

          <hr className="border-gray-200 mb-2" />

          <p className="text-[12px] font-bold text-gray-400 pl-1 mb-1">
            저장된 여행 일정 ({trips.length})
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center text-gray-400 mt-8 text-[13px]">
              <p>아직 저장된 여행이 없습니다.</p>
              <p className="mt-1">지금 바로 첫 여행을 기획해보세요!</p>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  currentTripId == trip.id
                    ? 'bg-purple-50/50 border-purple-300 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2.5 gap-2">
                  <h3
                    className={`font-bold text-[14px] leading-snug break-keep ${
                      currentTripId == trip.id
                        ? 'text-purple-900'
                        : 'text-gray-900'
                    }`}
                  >
                    {trip.title}
                  </h3>
                  {trip.is_public ? (
                    <span title="공개됨"><Globe className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" /></span>
                  ) : (
                    <span title="나만 보기"><Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /></span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium bg-gray-50 w-fit px-2 py-1 rounded-md">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>
                    {trip.start_date.replace(/-/g, '.')} ~ {trip.end_date.replace(/-/g, '.')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
