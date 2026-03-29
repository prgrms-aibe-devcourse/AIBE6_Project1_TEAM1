'use client'

import CommonButton from '@/components/common/CommonButton'
import FilterBadge from '@/components/domain/plan/FilterBadge'
import ItineraryMap from '@/components/domain/plan/ItineraryMap'
import MyTripsSidebar from '@/components/domain/plan/MyTripsSidebar'
import PlaceSearchModal from '@/components/domain/plan/PlaceSearchModal'
import SaveTripModal from '@/components/domain/plan/SaveTripModal'
import TimelineList from '@/components/domain/plan/TimelineList'
import PageContainer from '@/components/layout/PageContainer'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'
import {
  Calendar,
  FolderOpen,
  MoreHorizontal,
  Share2,
  Sparkles,
  X,
  Map as MapIcon,
  Plus,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

export type TransportType = 'walk' | 'transit' | 'taxi'

// 글로벌 공통 장소 데이터 구조
export interface Place {
  id: string
  kakao_place_id?: string
  name: string
  category: string
  address: string
  lat: number
  lng: number
  isNearStation?: boolean
  transportType?: TransportType
}

// 두 장소 사이의 예상 이동 시간을 '분' 단위 정수로 계산 (DB 저장용)
export function calcTravelMinutes(p1: Place, p2: Place, type: TransportType = 'transit'): number {
  const R = 6371
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180)
  const dLon = (p2.lng - p1.lng) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) *
      Math.cos(p2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const realDist = R * c * 1.4 // 도로 굴곡 보정 1.4배

  let speed = 15
  let waitTime = 5
  if (type === 'walk') { speed = 4.5; waitTime = 0 }
  else if (type === 'taxi') { speed = 25; waitTime = 3 }
  else if (type === 'transit') { speed = 20; waitTime = 8 }

  return Math.max(1, Math.round((realDist / speed) * 60 + waitTime))
}

// Day 요약 계산: 총 이동시간(분) + 예상 교통비(원) + 총 이동 거리(km)
function calcDaySummary(places: Place[]): { totalMins: number; totalCost: number; totalDistance: number } {
  let totalMins = 0
  let totalCost = 0
  let totalDistance = 0

  for (let i = 0; i < places.length - 1; i++) {
    const from = places[i]
    const to = places[i + 1]
    const mode = from.transportType || 'walk'
    const mins = calcTravelMinutes(from, to, mode)
    totalMins += mins

    // 거리 계산 (km)
    const R = 6371
    const dLat = (to.lat - from.lat) * (Math.PI / 180)
    const dLon = (to.lng - from.lng) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(from.lat * (Math.PI / 180)) * Math.cos(to.lat * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.4
    totalDistance += distKm

    if (mode === 'transit') {
      totalCost += 1500 // 대중교통 기본 요금
    } else if (mode === 'taxi') {
      const baseFare = 4800
      const extraFare = distKm > 1.6 ? Math.ceil((distKm - 1.6) * 1000 / 132) * 100 : 0
      totalCost += baseFare + extraFare
    }
  }
  return { totalMins, totalCost, totalDistance }
}

// 전체 여행 요약 계산 (모든 Day 합산)
function calcTripSummary(placesByDay: Record<number, Place[]>) {
  let totalMins = 0
  let totalCost = 0
  let totalDistance = 0

  Object.values(placesByDay).forEach((places) => {
    const summary = calcDaySummary(places)
    totalMins += summary.totalMins
    totalCost += summary.totalCost
    totalDistance += summary.totalDistance
  })

  return { totalMins, totalCost, totalDistance }
}

function PlanPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editTripId = searchParams.get('id') // URL에서 ?id= 파라미터 획득

  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // 여행 메타데이터 (제목, 날짜 등) 상단 Badge 연동용
  const [tripMetadata, setTripMetadata] = useState({
    title: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isPublic: true,
    imgUrl: '',
    tags: '',
  })

  // 1개짜리 배열에서 N박 M일을 지원하는 객체(Record) 형태로 확장
  const [placesByDay, setPlacesByDay] = useState<Record<number, Place[]>>({
    1: [],
  })
  // 현재 보고 있는 활성 탭 (ex: Day 1)
  const [currentDay, setCurrentDay] = useState<number>(1)

  // 특정 장소 클릭 시 지도를 해당 위치로 이동시키기 위한 상태
  const [focusPlace, setFocusPlace] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // 모달창 on/off 상태 관리
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // 사이드바 관리 추가
  const [isModified, setIsModified] = useState(false) // 수정 여부 추적 추가

  const { openModal } = useModalStore()

  const handleSelectTrip = (id: string) => {
    setIsSidebarOpen(false)

    // 현재 편집 중인 여행과 동일한 아이디를 클릭했다면 무시
    if (id === editTripId) return

    const executeNavigation = () => {
      if (id === 'new') {
        router.push('/plan')
        setPlacesByDay({ 1: [] })
        setCurrentDay(1)
        setTripMetadata({
          title: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          isPublic: true,
          imgUrl: '',
          tags: '',
        })
      } else {
        router.push(`/plan?id=${id}`)
      }
    }

    // 작성 중인 내용이 있고 수정된 사항이 있다면 모달로 확인
    if (isModified) {
      openModal({
        type: 'confirm',
        variant: 'primary',
        title: '페이지 이동 확인',
        description:
          '현재 작성 중인 일정이 저장되지 않았습니다.\n다른 일정을 불러오시겠습니까?',
        confirmText: '불러오기',
        cancelText: '취소',
        onConfirm: executeNavigation,
      })
    } else {
      executeNavigation()
    }
  }

  // 인증 검사 로직 (마운트 시점 1회 실행)
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // 비회원이면 뒤로가기 불가능한 대체(replace) 방식으로 로그인 창 이동
        router.replace('/login')
      } else {
        // 회원이면 고유 ID 저장 후 로딩 해제
        setUserId(session.user.id)
        setIsAuthChecking(false)
      }
    }

    checkAuth()
  }, [router])

  // editTripId가 존재하고 유저 인증이 완료되었을 때, DB에서 기존 플랜 데이터를 불러옵니다.
  useEffect(() => {
    if (!editTripId || !userId) return

    const fetchExistingTrip = async () => {
      try {
        const supabase = createClient()

        // trips와 매핑된 trip_items, places를 한 번에 Join해서 가져옵니다.
        const { data: tripData, error } = await supabase
          .from('trips')
          .select(
            `
            id, title, start_date, end_date, is_public, img_url, tags,
            trip_items (
              visit_day,
              visit_order,
              transport_type,
              travel_time,
              places (
                id, kakao_place_id, place_name, category, address, latitude, longitude, is_near_station
              )
            )
          `,
          )
          .eq('id', editTripId)
          .eq('user_id', userId)
          .single()

        if (error || !tripData) {
          console.error('여행 불러오기 에러 상세:', error?.message || error)
          openModal({
            type: 'alert',
            variant: 'danger',
            title: '여행 불러오기 실패',
            description: `여행 정보를 불러올 수 없습니다.\n(${error?.message || '알 수 없는 에러'})`,
          })
          return
        }

        // 여행 메타데이터 정보 갱신
        setTripMetadata({
          title: tripData.title || '',
          startDate: tripData.start_date || '',
          endDate: tripData.end_date || '',
          isPublic: tripData.is_public ?? true,
          imgUrl: tripData.img_url || '',
          tags: tripData.tags || '',
        })

        const fetchedPlacesByDay: Record<number, Place[]> = {}
        const items = tripData.trip_items || []

        // 데이터베이스의 visit_order 기준으로 카드 순서 정렬
        items.sort((a: any, b: any) => a.visit_order - b.visit_order)

        items.forEach((item: any) => {
          if (item.places) {
            const dayIndex = item.visit_day || 1

            if (!fetchedPlacesByDay[dayIndex]) {
              fetchedPlacesByDay[dayIndex] = []
            }

            fetchedPlacesByDay[dayIndex].push({
              id: Date.now().toString() + Math.random(),
              kakao_place_id: item.places.kakao_place_id,
              name: item.places.place_name,
              category: item.places.category,
              address: item.places.address || '주소 없음',
              lat: item.places.latitude,
              lng: item.places.longitude,
              isNearStation: item.places.is_near_station,
              transportType: item.transport_type as TransportType,
            })
          }
        })

        if (Object.keys(fetchedPlacesByDay).length === 0) {
          fetchedPlacesByDay[1] = []
        }

        setPlacesByDay(fetchedPlacesByDay)
        setCurrentDay(1)
        setIsModified(false)
      } catch (err) {
        console.error('플랜 로딩 중 문제 발생:', err)
      }
    }

    fetchExistingTrip()
  }, [editTripId, userId])

  // 모달창에서 장소를 선택했을 때 새 장소를 현재 날짜(Day) 탭에 추가하는 함수
  const handleAddPlace = (
    kakao_place_id: string,
    lat: number,
    lng: number,
    name: string,
    category: string,
    address: string,
    isNearStation: boolean,
  ) => {
    const newPlace: Place = {
      id: Date.now().toString(),
      kakao_place_id,
      name,
      category,
      address,
      lat,
      lng,
      isNearStation,
      transportType: 'walk',
    }
    setPlacesByDay((prev) => ({
      ...prev,
      [currentDay]: [...(prev[currentDay] || []), newPlace],
    }))
    setIsModified(true)
  }

  const handleReorderPlaces = (startIndex: number, endIndex: number) => {
    setPlacesByDay((prev) => {
      const dayPlaces = Array.from(prev[currentDay] || [])
      const [removed] = dayPlaces.splice(startIndex, 1)
      dayPlaces.splice(endIndex, 0, removed)
      return { ...prev, [currentDay]: dayPlaces }
    })
    setIsModified(true)
  }
  
  const handleUpdateTransport = (id: string, type: TransportType) => {
    setPlacesByDay((prev) => {
      const dayPlaces = (prev[currentDay] || []).map((p) => 
        p.id === id ? { ...p, transportType: type } : p
      )
      return { ...prev, [currentDay]: dayPlaces }
    })
    setIsModified(true)
  }

  const handleDeletePlace = (id: string) => {
    setPlacesByDay((prev) => ({
      ...prev,
      [currentDay]: (prev[currentDay] || []).filter((p) => p.id !== id),
    }))
    setIsModified(true)
  }

  const handleDeleteDay = (dayToDelete: number) => {
    const dayPlaces = placesByDay[dayToDelete] || []

    if (Object.keys(placesByDay).length <= 1) {
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '날짜 삭제 불가',
        description: '최소 한 개의 날짜는 유지해야 합니다.',
      })
      return
    }

    if (dayPlaces.length > 0) {
      if (
        !confirm(
          `Day ${dayToDelete}에 등록된 장소가 ${dayPlaces.length}개 있습니다. 정말 삭제하시겠습니까?`,
        )
      ) {
        return
      }
    }

    setPlacesByDay((prev) => {
      const newPlacesByDay: Record<number, Place[]> = {}
      const sortedDays = Object.keys(prev)
        .map(Number)
        .sort((a, b) => a - b)

      let nextDayLabel = 1
      sortedDays.forEach((day) => {
        if (day !== dayToDelete) {
          newPlacesByDay[nextDayLabel] = prev[day]
          nextDayLabel++
        }
      })

      if (currentDay === dayToDelete) {
        setCurrentDay(Math.max(1, dayToDelete - 1))
      } else if (currentDay > dayToDelete) {
        setCurrentDay(currentDay - 1)
      }
      setIsModified(true)
      return newPlacesByDay
    })
  }

  const [isSaving, setIsSaving] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Gemini AI 동선 최적화 핸들러
  const handleAiOptimize = async () => {
    const currentPlaces = placesByDay[currentDay] || []
    if (currentPlaces.length < 2) {
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '장소 부족',
        description: '동선 최적화를 위해 현재 Day에 2개 이상의 장소가 필요합니다.',
      })
      return
    }

    setIsOptimizing(true)
    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          places: currentPlaces.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            lat: p.lat,
            lng: p.lng,
            transportType: p.transportType,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // order 배열 순서대로 places 재정렬
      const reordered = (data.order as number[]).map((i: number) => currentPlaces[i])
      setPlacesByDay((prev) => ({ ...prev, [currentDay]: reordered }))
      setIsModified(true)

      openModal({
        type: 'alert',
        variant: 'primary',
        title: '✨ AI 동선 최적화 완료',
        description: data.reason,
      })
    } catch (err) {
      console.error(err)
      openModal({
        type: 'alert',
        variant: 'danger',
        title: 'AI 최적화 실패',
        description: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleSaveTrip = async (
    title: string,
    startDate: string,
    endDate: string,
    isPublic: boolean,
    imgUrl: string,
    tags: string,
  ) => {
    if (!userId) {
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '로그인 필요',
        description: '일정을 저장하시려면 로그인이 필요합니다.',
      })
      return
    }

    const totalPlacesCount = Object.values(placesByDay).flat().length

    if (totalPlacesCount === 0) {
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '장소 부족',
        description: '여행 장소를 전체 Day 통틀어 1개 이상 추가해주세요!',
      })
      return
    }

    const { totalMins, totalCost, totalDistance } = calcTripSummary(placesByDay)

    setIsSaving(true)
    try {
      const supabase = createClient()
      let tripId = editTripId

      if (!editTripId) {
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .insert({
            user_id: userId,
            title: title,
            start_date: startDate,
            end_date: endDate,
            is_public: isPublic,
            total_distance: totalDistance,
            is_saved: true,
            img_url: imgUrl,
            tags: tags,
          })
          .select()
          .single()

        if (tripError || !tripData) {
          throw new Error(tripError?.message || '플랜 생성 실패')
        }
        tripId = tripData.id
      } else {
        const { error: tripError } = await supabase
          .from('trips')
          .update({
            title: title,
            start_date: startDate,
            end_date: endDate,
            is_public: isPublic,
            total_distance: totalDistance,
            is_saved: true,
            img_url: imgUrl,
            tags: tags,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editTripId)
          .eq('user_id', userId)

        if (tripError) throw new Error('플랜 수정 실패')

        await supabase.from('trip_items').delete().eq('trip_id', editTripId)
      }

      let globalOrder = 1

      for (const dayStr of Object.keys(placesByDay)) {
        const dayPlaces = placesByDay[parseInt(dayStr)]

        for (let i = 0; i < dayPlaces.length; i++) {
          const place = dayPlaces[i]
          let dbPlaceId: number | null = null

          if (place.kakao_place_id) {
            const { data: existingPlace } = await supabase
              .from('places')
              .select('id')
              .eq('kakao_place_id', place.kakao_place_id)
              .maybeSingle()

            if (existingPlace) {
              dbPlaceId = existingPlace.id
            } else {
              const { data: newPlace, error: placeError } = await supabase
                .from('places')
                .insert({
                  kakao_place_id: place.kakao_place_id,
                  place_name: place.name,
                  category: place.category,
                  address: place.address,
                  latitude: place.lat,
                  longitude: place.lng,
                  is_near_station: place.isNearStation ?? false,
                })
                .select('id')
                .single()

              if (newPlace) dbPlaceId = newPlace.id
            }
          }

          if (dbPlaceId) {
            const nextPlace = dayPlaces[i + 1]
            const travelMins = nextPlace
              ? calcTravelMinutes(place, nextPlace, place.transportType || 'walk')
              : 0

            await supabase.from('trip_items').insert({
              trip_id: tripId,
              place_id: dbPlaceId,
              visit_day: parseInt(dayStr),
              visit_order: globalOrder++,
              transport_type: place.transportType || 'walk',
              travel_time: travelMins,
            })
          }
        }
      }

      openModal({
        type: 'alert',
        variant: 'primary',
        title: '저장 완료',
        description: '플랜이 내 보관함에 저장되었습니다!',
      })

      setTripMetadata({
        title,
        startDate,
        endDate,
        isPublic,
        imgUrl,
        tags,
      })
      setIsModified(false)
    } catch (error) {
      console.error(error)
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '저장 실패',
        description: '일정을 저장하는 도중 오류가 발생했습니다.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">
          인증 정보를 확인하는 중입니다...
        </p>
      </div>
    )
  }

  const currentPlaces = placesByDay[currentDay] || []

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {isSearchOpen && (
        <PlaceSearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelect={(kakaoId, lat, lng, name, category, addr, isNear) => {
            handleAddPlace(kakaoId, lat, lng, name, category, addr, isNear)
            setIsSearchOpen(false)
          }}
        />
      )}

      <MyTripsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userId={userId}
        currentTripId={editTripId}
        onSelectTrip={handleSelectTrip}
      />

      {isSaveModalOpen && (
        <SaveTripModal
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveTrip}
          totalDays={Object.keys(placesByDay).length}
          userId={userId}
          initialData={editTripId ? tripMetadata : undefined}
        />
      )}

      <PageContainer className="flex-1 py-8">
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-start w-full mb-3">
            <div className="flex items-center gap-4">
              <h1 className="text-[22px] font-bold text-gray-900 flex items-center gap-3">
                여행 일정 플래너
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all flex items-center gap-1.5 shadow-sm ml-2"
                >
                  <FolderOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">내 보관함</span>
                </button>
              </h1>
              <div className="flex items-center gap-2">
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] flex items-center gap-1.5 rounded-full">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  {tripMetadata.startDate
                    ? (() => {
                        const d = new Date(tripMetadata.startDate)
                        d.setDate(d.getDate() + (currentDay - 1))
                        return d.toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })
                      })()
                    : '날짜 미정'}
                </FilterBadge>
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] rounded-full">
                  Day {currentDay}
                </FilterBadge>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
              <button className="p-1 hover:text-gray-900 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-1 hover:text-gray-900 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <CommonButton
                onClick={() => setIsSaveModalOpen(true)}
                disabled={isSaving || isSaveModalOpen || (editTripId ? !isModified : false)}
                className={`!rounded-lg px-4 py-2 flex items-center gap-2 text-[13px] font-semibold border-none ml-2 shadow-sm transition-all ${
                  !editTripId || isModified
                    ? '!bg-purple-600 !text-white hover:!bg-purple-700'
                    : '!bg-gray-200 !text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving
                  ? '저장 중...'
                  : editTripId
                    ? isModified
                      ? '일정 수정하기'
                      : '일정 수정하기'
                    : '일정 저장하기'}
              </CommonButton>
            </div>
          </div>

          <div className="mb-2">
            <CommonButton
              onClick={handleAiOptimize}
              disabled={isOptimizing || currentPlaces.length < 2}
              className={`!rounded-lg px-4 py-2 flex items-center gap-2 text-xs border-none transition-all ${
                isOptimizing
                  ? '!bg-gray-600 !text-gray-300 cursor-not-allowed'
                  : currentPlaces.length < 2
                  ? '!bg-gray-300 !text-gray-500 cursor-not-allowed'
                  : '!bg-gray-900 !text-white hover:!bg-purple-700'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
              {isOptimizing ? 'AI 분석 중...' : 'AI 동선 최적화'}
            </CommonButton>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row w-full gap-8 h-[calc(100vh-240px)] min-h-[600px]">
          <div className="w-full lg:w-[55%] xl:w-[60%] h-[400px] lg:h-full relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
            <ItineraryMap places={currentPlaces} focusPlace={focusPlace} />
          </div>

          <div className="w-full lg:w-[45%] xl:w-[40%] h-full flex flex-col relative pr-2">
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide pt-1 px-1">
              {Object.keys(placesByDay).map((dayStr) => {
                const day = parseInt(dayStr)
                return (
                  <button
                    key={day}
                    onClick={() => setCurrentDay(day)}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 ${
                      currentDay === day
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-400 hover:bg-purple-50 hover:text-purple-400'
                    }`}
                  >
                    Day {day}
                    {currentDay === day && Object.keys(placesByDay).length > 1 && (
                      <X
                        className="w-3 h-3 ml-1 hover:text-red-200 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDay(day)
                        }}
                      />
                    )}
                  </button>
                )
              })}
              <button
                onClick={() => {
                  const nextDay = Object.keys(placesByDay).length + 1
                  setPlacesByDay((prev) => ({ ...prev, [nextDay]: [] }))
                  setCurrentDay(nextDay)
                  setIsModified(true)
                }}
                className="p-2.5 bg-white border border-dashed border-gray-300 rounded-full hover:border-purple-400 hover:bg-purple-50 transition-all shadow-sm flex-shrink-0"
                title="날짜 추가"
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 pb-20 scrollbar-hide">
              <TimelineList
                places={currentPlaces}
                onReorder={handleReorderPlaces}
                onDelete={handleDeletePlace}
                onSelectPlace={setFocusPlace}
                onUpdateTransport={handleUpdateTransport}
                onOpenSearch={() => setIsSearchOpen(true)}
              />

              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-full py-4 mt-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-[13px] hover:border-purple-300 hover:bg-purple-50 hover:text-purple-500 transition-all flex items-center justify-center gap-2 bg-white"
              >
                <Plus className="w-4 h-4" /> 장소 추가하기
              </button>
            </div>

            <div className="absolute bottom-6 left-1 right-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100/50 flex items-center justify-between z-10 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Summary</span>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-black text-gray-900 leading-none">
                      {calcDaySummary(currentPlaces).totalMins > 60
                        ? `${Math.floor(calcDaySummary(currentPlaces).totalMins / 60)}h ${calcDaySummary(currentPlaces).totalMins % 60}m`
                        : `${calcDaySummary(currentPlaces).totalMins}m`}
                    </span>
                  </div>
                  <div className="w-[1px] h-4 bg-gray-200" />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-black text-purple-600 leading-none">
                      {calcDaySummary(currentPlaces).totalCost.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 rounded-xl">
                 <MapIcon className="w-3.5 h-3.5 text-purple-400" />
                 <span className="text-[11px] font-bold text-white whitespace-nowrap">
                   {calcDaySummary(currentPlaces).totalDistance.toFixed(1)}km
                 </span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanPageContent />
    </Suspense>
  )
}

