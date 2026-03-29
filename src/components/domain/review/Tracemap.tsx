'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useRef, useState } from 'react'

const supabase = createClient()

declare global {
  interface Window {
    kakao: any
  }
}

type TripItem = {
  trip_id: string
  visit_order: number
  latitude: number
  longitude: number
}

type Trips = Record<string, TripItem[]>

// ---------------- HSV → HEX (trip 색상용)
function HSVtoHex(h: number, s = 100, v = 100): string {
  s /= 100
  v /= 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0,
    g = 0,
    b = 0
  if (0 <= h && h < 60) [r, g, b] = [c, x, 0]
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0]
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x]
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c]
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c]
  else if (300 <= h && h < 360) [r, g, b] = [c, 0, x]
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ---------------- tripId → 고정 색상
// function getColorByTripId(tripId: string): string {
//   const hash = tripId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
//   return HSVtoHex(hash % 360, 80, 90)
// }
function getColorByTripId(tripId: string): string {
  // 1. SDBM 해시로 고유 숫자 생성
  let hash = 0
  for (let i = 0; i < tripId.length; i++) {
    hash = tripId.charCodeAt(i) + (hash << 6) + (hash << 16) - hash
  }

  // 2. 황금비(Golden Ratio Conjugate)를 활용한 색상 분산
  // 이 상수를 더해주면 색상환(0~360)에서 색이 아주 골고루 퍼지게 돼.
  const goldenRatioConjugate = 0.618033988749895
  let h = Math.abs(hash) * goldenRatioConjugate
  h = (h % 1) * 360 // 0~360 사이의 값으로 변환

  // 3. 채도와 명도를 고정해서 선명한 색 유지
  // S(채도): 80%, V(명도): 90% 정도면 아주 쨍한 색이 나와.
  return HSVtoHex(h, 80, 90)
}

// ---------------- Supabase에서 trip_items 가져오기
// ---------------- Supabase에서 trip_items + places(좌표) 가져오기
async function getUserTripItemsWithCoords(userId: string): Promise<Trips> {
  // 1. 사용자가 작성한 리뷰의 trip_id 목록 가져오기
  const { data: reviews } = await supabase
    .from('reviews')
    .select('trip_id')
    .eq('user_id', userId)

  if (!reviews || reviews.length === 0) return {}

  const tripIds = reviews.map((r) => r.trip_id)

  // 2. trip_items를 가져오면서 places 테이블의 좌표를 Join해서 가져오기
  // 'places!inner(latitude, longitude)'는 외래키 관계일 때 사용 가능해.
  // 만약 관계 설정이 안 되어 있다면 개별 쿼리를 해야 하지만, 보통은 이렇게 한 번에 가져와.
  const { data: tripItems, error } = await supabase
    .from('trip_items')
    .select(
      `
      trip_id, 
      visit_order, 
      place_id,
      places (
        latitude,
        longitude
      )
    `,
    )
    .in('trip_id', tripIds)

  if (error || !tripItems) {
    console.error('데이터 로드 에러:', error)
    return {}
  }

  const trips: Trips = {}

  tripItems.forEach((item: any) => {
    // places 데이터가 있는지 안전하게 확인
    if (item.places) {
      if (!trips[item.trip_id]) trips[item.trip_id] = []
      trips[item.trip_id].push({
        trip_id: item.trip_id,
        visit_order: item.visit_order,
        latitude: item.places.latitude,
        longitude: item.places.longitude,
      })
    }
  })

  // 방문 순서대로 정렬
  for (let tripId in trips) {
    trips[tripId].sort((a, b) => a.visit_order - b.visit_order)
  }

  return trips
}

// ---------------- 지도에 마커 + Polyline 표시
function showTripsOnMap(map: any, trips: Trips) {
  // 1. 모든 좌표를 포함할 범위를 계산하는 객체 생성
  const bounds = new window.kakao.maps.LatLngBounds()
  let hasCoords = false

  Object.keys(trips).forEach((tripId) => {
    const items = trips[tripId]
    const coords: any[] = []

    items.forEach((item) => {
      const { latitude, longitude, visit_order } = item
      const lat = Number(item.latitude)
      const lng = Number(item.longitude)

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(
          `유효하지 않은 좌표 데이터: trip ${tripId}, order ${item.visit_order}`,
        )
        return
      }
      const position = new window.kakao.maps.LatLng(lat, lng)
      coords.push(position)

      // 2. 이 좌표를 범위(bounds)에 포함시킴
      bounds.extend(position)
      hasCoords = true

      // --- 마커 생성 로직 (기존과 동일) ---
      const svgMarker = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
          <circle cx="18" cy="18" r="16" fill="${getColorByTripId(tripId)}" stroke="#fff" stroke-width="3"/>
          <text x="18" y="22" font-size="14" font-family="Arial" fill="#fff" text-anchor="middle" alignment-baseline="middle">${visit_order}</text>
        </svg>`
      const blob = new Blob([svgMarker], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)

      const marker = new window.kakao.maps.Marker({
        position,
        image: new window.kakao.maps.MarkerImage(
          url,
          new window.kakao.maps.Size(36, 36),
        ),
      })
      marker.setMap(map)
      // ---------------------------------
    })

    const polyline = new window.kakao.maps.Polyline({
      path: coords,
      strokeWeight: 4,
      strokeColor: getColorByTripId(tripId),
      strokeOpacity: 0.8,
      strokeStyle: 'solid',
    })
    polyline.setMap(map)
  })

  // 3. 만약 데이터가 있다면, 지도 범위를 해당 좌표들이 모두 보이는 곳으로 이동
  if (hasCoords) {
    map.setBounds(bounds)
  }
}

// ---------------- TraceMap 컴포넌트
interface KakaoTripMapProps {
  userId: string
}

export default function TraceMap({ userId }: KakaoTripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [trips, setTrips] = useState<Trips>({}) // trips 상태 추가
  const [mapInstance, setMapInstance] = useState<any>(null) // 지도 인스턴스 저장용

  const loadKakaoMap = () => {
    return new Promise<void>((resolve) => {
      // 이미 로드되어 있다면 바로 해결
      if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
        return resolve()
      }

      const script = document.createElement('script')
      // 핵심: URL 끝에 &autoload=false 추가
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&libraries=services,clusterer&autoload=false`
      script.async = true

      script.onload = () => {
        // autoload=false일 때는 반드시 kakao.maps.load 콜백 안에서 로직을 실행해야 함
        window.kakao.maps.load(() => {
          resolve()
        })
      }

      document.head.appendChild(script)
    })
  }

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      // 1. 카카오맵 로드 (기존 loadKakaoMap 함수 호출 부분은 생략, 로직은 동일)
      await loadKakaoMap()

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 5,
      })
      setMapInstance(map)

      // 2. 데이터 가져오기 및 상태 저장
      const fetchedTrips = await getUserTripItemsWithCoords(userId)
      setTrips(fetchedTrips)

      // 3. 지도에 표시
      showTripsOnMap(map, fetchedTrips)
    }

    initMap()
  }, [userId])

  return (
    // 전체 컨테이너: flex를 사용해 가로 배치
    <div className="flex w-full h-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* 왼쪽 패널: 여행 목록 */}
      <aside className="w-1/4 min-w-[200px] bg-white border-r border-gray-200 overflow-y-auto p-4">
        <h2 className="text-lg font-bold mb-4">여행 일정 목록</h2>
        <div className="space-y-3">
          {Object.keys(trips).length === 0 ? (
            <p className="text-sm text-gray-400">등록된 일정이 없습니다.</p>
          ) : (
            Object.keys(trips).map((tripId) => (
              <div
                key={tripId}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                onClick={() => {
                  // 클릭 시 해당 여행의 첫 번째 장소로 지도 이동 (선택 사항)
                  const firstItem = trips[tripId][0]
                  if (mapInstance && firstItem) {
                    mapInstance.panTo(
                      new window.kakao.maps.LatLng(
                        firstItem.latitude,
                        firstItem.longitude,
                      ),
                    )
                  }
                }}
              >
                {/* Polyline 색상과 동일한 원 표시 */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getColorByTripId(tripId) }}
                />
                <span className="text-sm font-medium truncate">
                  여행 ID: {tripId.slice(0, 8)}...{' '}
                  {/* 실제 데이터가 있다면 여행 제목으로 변경 */}
                </span>
                <span className="text-[10px] text-gray-400 ml-auto">
                  {trips[tripId].length}곳
                </span>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* 오른쪽 영역: 지도 */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  )
}
