'use client'

import { createClient } from '@/utils/supabase/client'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  Map as MapIcon,
  Plus,
  X,
  Hash,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useModalStore } from '@/store/useModalStore'

const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMins = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMins / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMins < 1) return '방금 전'
  if (diffInMins < 60) return `${diffInMins}분 전`
  if (diffInHours < 24) return `${diffInHours}시간 전`
  if (diffInDays < 7) return `${diffInDays}일 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

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
  const { openModal } = useModalStore()
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTrips = async (isSilent = false) => {
    if (!userId) return
    if (!isSilent) setIsLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.from('trips').select(`
        *,
        travelers (
          has_visited, 
          status,
          user_id
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }) // 최신 수정순 정렬

    if (!error && data) {
      setTrips(data)
    }
    setIsLoading(false)
  }

  // 사이드바가 열릴 때마다 사용자의 여행 목록을 DB에서 최신화하여 불러옵니다.
  useEffect(() => {
    if (isOpen && userId) {
      fetchTrips()
    }
  }, [isOpen, userId])

  const handleToggleVisited = async (
    e: React.MouseEvent,
    tripId: string,
    currentVisited: boolean,
  ) => {
    e.stopPropagation() // 부모의 onClick(일정 선택) 이벤트 전파 방지
    if (!userId) return

    const supabase = createClient()

    // 1. 해당 유저의 traveler 레코드가 있는지 확인
    const { data: traveler } = await supabase
      .from('travelers')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .maybeSingle()

    if (traveler) {
      // 2. 기존 레코드가 있으면 업데이트
      await supabase
        .from('travelers')
        .update({ has_visited: !currentVisited })
        .eq('id', traveler.id)
    } else {
      // 3. 없으면 새로 생성
      await supabase.from('travelers').insert({
        trip_id: tripId,
        user_id: userId,
        has_visited: !currentVisited,
        status: !currentVisited ? 'completed' : 'ongoing',
      })
    }

    // 4. 최신 데이터로 리스트 갱신 (리스트가 깜빡이지 않도록 isSilent = true 적용)
    await fetchTrips(true)
  }

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string, title: string) => {
    e.stopPropagation()
    
    openModal({
      type: 'confirm',
      variant: 'danger',
      title: '일정 삭제',
      description: `"${title}" 일정을 정말 삭제하시겠습니까? 삭제된 일정은 복구할 수 없습니다.`,
      confirmText: '삭제하기',
      cancelText: '취소',
      onConfirm: async () => {
        const supabase = createClient()
        const { error } = await supabase
          .from('trips')
          .delete()
          .eq('id', tripId)

        if (error) {
          alert('일정 삭제 중 오류가 발생했습니다.')
        } else {
          // 로컬 상태에서 삭제 반영
          setTrips(prev => prev.filter(t => t.id !== tripId))
          // 만약 현재 보고 있는 일정을 삭제했다면 목록 첫 번째나 빈 화면으로 이동 유도 가능 (여기서는 단순 UI 갱신)
        }
      }
    })
  }

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
        className={`fixed top-0 left-0 h-full w-[420px] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-[160] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-gray-900 text-[16px] flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-purple-600" /> 내 보관함
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 내 일정 리스트 */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#fafafa] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
            trips.map((trip) => {
              const now = new Date()
              const today = now.toISOString().split('T')[0]

              // 현재 로그인한 사용자의 traveler 정보를 찾습니다.
              const myTravelerInfo = trip.travelers?.find(
                (t: any) => t.user_id === userId,
              )

              // travelers 테이블의 has_visited 컬럼을 우선적으로 사용합니다.
              const isFinished = myTravelerInfo?.has_visited === true
              // 여행 중 상태는 status가 'ongoing'이거나 날짜 범위 내에 있을 때로 판별합니다.
              const isActive =
                myTravelerInfo?.status === 'ongoing' ||
                (trip.start_date &&
                  trip.end_date &&
                  today >= trip.start_date &&
                  today <= trip.end_date &&
                  !isFinished)

              return (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    currentTripId == trip.id
                      ? 'bg-purple-50/50 border-purple-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* 대표 이미지 썸네일 */}
                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-gray-100 shadow-inner">
                      <img 
                        src={trip.img_url || '/icon.svg'} 
                        alt="코스 대표 사진" 
                        className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${!trip.img_url ? 'p-3.5 opacity-20 grayscale' : ''}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <div className="flex flex-col gap-1.5 flex-1">
                          {isFinished ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> 코스 완주
                            </span>
                          ) : isActive ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 animate-pulse w-fit">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
                              </span>
                              코스 탐방
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 w-fit">
                              코스 대기
                            </span>
                          )}
                          <h3
                            className={`font-bold text-[14px] leading-snug break-keep line-clamp-2 ${
                              currentTripId == trip.id
                                ? 'text-purple-900'
                                : isFinished
                                  ? 'text-gray-500'
                                  : 'text-gray-900'
                            }`}
                          >
                            {trip.title}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end gap-2 mt-0.5 shrink-0">
                          <div className="flex items-center gap-1.5">
                            {trip.is_public ? (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100 flex-shrink-0">
                                <Eye className="w-3 h-3" />
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded text-[10px] font-bold border border-gray-100 flex-shrink-0">
                                <EyeOff className="w-3 h-3" />
                              </span>
                            )}
                            <button
                              onClick={(e) =>
                                handleToggleVisited(e, trip.id, isFinished)
                              }
                              title={
                                isFinished ? '미방문으로 표시' : '다녀옴으로 표시'
                              }
                              className={`group/btn w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border ${
                                isFinished
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200 active:scale-95'
                                  : 'bg-white border-gray-200 text-transparent hover:border-emerald-500 hover:bg-emerald-50/50 active:scale-110'
                              }`}
                            >
                              <CheckCircle2 className={`w-4 h-4 transition-transform duration-300 ${isFinished ? 'scale-100 fill-white' : 'scale-0 group-hover/btn:scale-110 group-hover/btn:text-emerald-500/50'}`} />
                            </button>

                            <button
                              onClick={(e) => handleDeleteTrip(e, trip.id, trip.title)}
                              title="일정 삭제"
                              className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 text-[11px] font-medium w-fit px-2 py-1 rounded-md ${
                          isFinished
                            ? 'bg-gray-50 text-gray-400 border border-gray-100'
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        <CalendarIcon className="w-2.5 h-2.5" />
                        <span className="text-[10px]">
                          {trip.start_date ? trip.start_date.replace(/-/g, '.') : '-'} ~{' '}
                          {trip.end_date ? trip.end_date.replace(/-/g, '.') : '-'}
                        </span>
                      </div>

                      {/* 해시태그 표시 영역 */}
                      {trip.tags && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {trip.tags.split(/[#\s]+/).filter(Boolean).map((tag: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-50 text-[9px] font-bold text-purple-600 border border-purple-100/50"
                            >
                              <Hash className="w-2 h-2" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 작성 및 수정 정보 */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                    <div className="flex items-center gap-1">
                      <span className="opacity-70">작성</span>
                      <span>{new Date(trip.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="opacity-70">수정</span>
                      <span className={`font-semibold ${
                        (new Date().getTime() - new Date(trip.updated_at).getTime()) < 3600000 
                        ? 'text-purple-500' 
                        : 'text-gray-500'
                      }`}>
                        {getRelativeTime(trip.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
