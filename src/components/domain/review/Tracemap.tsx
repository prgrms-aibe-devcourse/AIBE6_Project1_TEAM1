'use client'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const supabase = createClient()

declare global {
  interface Window {
    kakao: any
  }
}

type TripItem = {
  trip_id: string
  title: string
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
  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ---------------- tripId → 고정 색상
function getColorByTripId(tripId: string): string {
  let hash = 0
  for (let i = 0; i < tripId.length; i++) {
    hash = tripId.charCodeAt(i) + (hash << 6) + (hash << 16) - hash
  }
  const goldenRatioConjugate = 0.618033988749895
  let h = Math.abs(hash) * goldenRatioConjugate
  h = (h % 1) * 360
  return HSVtoHex(h, 80, 90)
}

// ---------------- Supabase에서 trip_items 가져오기
async function getTripsByTripIds(tripIds: string[]): Promise<Trips> {
  if (!tripIds || tripIds.length === 0) return {}

  const { data: tripItems, error } = await supabase
    .from('trip_items')
    .select(
      `
      trip_id,
      trips ( title ),
      visit_order,
      place_id,
      places ( latitude, longitude )
    `,
    )
    .in('trip_id', tripIds)

  if (error || !tripItems) {
    console.error('데이터 로드 에러:', error)
    return {}
  }

  const trips: Trips = {}
  tripItems.forEach((item: any) => {
    if (item.places) {
      if (!trips[item.trip_id]) trips[item.trip_id] = []
      const tripTitle = item.trips?.title || '제목 없는 여행'
      trips[item.trip_id].push({
        trip_id: item.trip_id,
        title: tripTitle,
        visit_order: item.visit_order,
        latitude: item.places.latitude,
        longitude: item.places.longitude,
      })
    }
  })

  for (let tripId in trips) {
    trips[tripId].sort((a, b) => a.visit_order - b.visit_order)
  }

  return trips
}

// ---------------- TraceMap 컴포넌트
interface KakaoTripMapProps {
  userId: string
  tripIds: string[]
}

export default function TraceMap({ userId, tripIds }: KakaoTripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [trips, setTrips] = useState<Trips>({})
  const [mapInstance, setMapInstance] = useState<any>(null)

  const loadKakaoMap = () => {
    return new Promise<void>((resolve) => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng)
        return resolve()
      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&libraries=services,clusterer&autoload=false`
      script.async = true
      script.onload = () => window.kakao.maps.load(() => resolve())
      document.head.appendChild(script)
    })
  }

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      await loadKakaoMap()

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 5,
      })
      setMapInstance(map)

      const fetchedTrips = await getTripsByTripIds(tripIds)
      setTrips(fetchedTrips)
      showTripsOnMap(map, fetchedTrips)
    }

    initMap()
  }, [userId, tripIds])

  const router = useRouter()

  // ---------------- 지도에 마커 + Polyline 표시 (클러스터러 적용)
  function showTripsOnMap(map: any, trips: Trips) {
    const bounds = new window.kakao.maps.LatLngBounds()
    let hasCoords = false

    const clusterer: any = new window.kakao.maps.MarkerClusterer({
      map: map,
      averageCenter: true,
      minLevel: 1,
    })

    Object.keys(trips).forEach((tripId) => {
      const items = trips[tripId]
      const coords: any[] = []

      items.forEach((item) => {
        const { latitude, longitude, visit_order } = item
        const lat = Number(latitude)
        const lng = Number(longitude)
        if (isNaN(lat) || isNaN(lng)) return

        const position = new window.kakao.maps.LatLng(lat, lng)
        coords.push(position)

        bounds.extend(position)
        hasCoords = true

        // SVG 마커 생성
        const svgMarker = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
          <circle cx="18" cy="18" r="16" fill="${getColorByTripId(
            tripId,
          )}" stroke="#fff" stroke-width="3"/>
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

        clusterer.addMarker(marker)
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

    if (hasCoords) {
      map.setBounds(bounds)
    }
  }

  return (
    <div className="relative w-4/5 max-w-6xl h-full mx-auto border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="absolute inset-y-0 right-0 w-4/5 z-0">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      <aside className="absolute top-6 left-6 z-10 w-72 max-h-[calc(100%-3rem)] bg-white/95 backdrop-blur shadow-2xl rounded-2xl border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-white flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
            여행 발자취
          </h2>
          <button
            onClick={() => router.push('/mypage/triplogs')}
            className="ml-4 px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
          >
            목록으로
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {Object.keys(trips).length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">등록된 일정이 없습니다.</p>
            </div>
          ) : (
            Object.keys(trips).map((tripId) => {
              const currentTripItems = trips[tripId]
              const displayTitle = currentTripItems[0]?.title || '제목 없음'

              return (
                <div
                  key={tripId}
                  className="group flex flex-col gap-2 p-3.5 hover:bg-blue-50/50 rounded-xl transition-all cursor-pointer border border-slate-50 hover:border-blue-100 bg-white shadow-sm"
                  onClick={() => {
                    const firstItem = currentTripItems[0]
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
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full ring-4 ring-slate-50"
                      style={{ backgroundColor: getColorByTripId(tripId) }}
                    />
                    <span className="text-sm font-bold text-gray-700 truncate group-hover:text-blue-600 transition-colors">
                      {displayTitle}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pl-5">
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                      {currentTripItems.length}곳
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>
    </div>
  )
}
