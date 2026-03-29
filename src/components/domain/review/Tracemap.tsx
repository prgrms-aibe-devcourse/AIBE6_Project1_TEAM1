'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useRef } from 'react'

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

function HSVtoHex(h: number, s = 100, v = 100): string {
  s /= 100
  v /= 100
  const c = v * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = v - c
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

function getColorByTripId(tripId: string): string {
  const hash = tripId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return HSVtoHex(hash % 360, 80, 90)
}

async function getUserTripItemsWithCoords(userId: string): Promise<Trips> {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('trip_id')
    .eq('user_id', userId)
  if (!reviews) return {}
  const tripIds = reviews.map((r) => r.trip_id)
  const { data: tripItems } = await supabase
    .from('trip_items')
    .select('trip_id, visit_order, latitude, longitude')
    .in('trip_id', tripIds)
  if (!tripItems) return {}
  const trips: Trips = {}
  tripItems.forEach((item) => {
    if (!trips[item.trip_id]) trips[item.trip_id] = []
    trips[item.trip_id].push(item)
  })
  for (let tripId in trips)
    trips[tripId].sort((a, b) => a.visit_order - b.visit_order)
  return trips
}

function showTripsOnMap(map: any, trips: Trips) {
  Object.keys(trips).forEach((tripId) => {
    const items = trips[tripId]
    const coords: any[] = []

    items.forEach((item) => {
      const { latitude, longitude, visit_order } = item
      const position = new window.kakao.maps.LatLng(latitude, longitude)
      coords.push(position)

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

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;">Trip ${tripId} - 순서 ${visit_order}</div>`,
      })
      window.kakao.maps.event.addListener(marker, 'click', () =>
        infowindow.open(map, marker),
      )
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
}

interface KakaoTripMapProps {
  userId: string
}

export default function TraceMap({ userId }: KakaoTripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let script: HTMLScriptElement | null = null

    const loadMap = async () => {
      if (!window.kakao) {
        script = document.createElement('script')
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&libraries=services,clusterer`
        script.async = true
        document.head.appendChild(script)

        script.onload = async () => {
          const map = new window.kakao.maps.Map(mapRef.current, {
            center: new window.kakao.maps.LatLng(37.5665, 126.978),
            level: 5,
          })
          const trips = await getUserTripItemsWithCoords(userId)
          showTripsOnMap(map, trips)
        }
      } else {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        })
        const trips = await getUserTripItemsWithCoords(userId)
        showTripsOnMap(map, trips)
      }
    }

    loadMap()

    // 항상 cleanup 함수 반환
    return () => {
      if (script) document.head.removeChild(script)
    }
  }, [userId])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
