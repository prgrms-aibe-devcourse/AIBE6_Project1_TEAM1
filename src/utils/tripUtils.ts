/**
 * @file tripUtils.ts
 * @description 여행 일정 관련 공통 유틸리티 함수들을 정의합니다.
 */

export type TransportType = 'walk' | 'transit' | 'taxi'

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

/**
 * 두 장소 사이의 예상 이동 시간을 '분' 단위 정수로 계산 (DB 저장용)
 * @param p1 출발지
 * @param p2 도착지
 * @param type 이동 수단 ('walk', 'transit', 'taxi')
 * @returns 예상 소요 시간 (분)
 */
export function calcTravelMinutes(p1: Place, p2: Place, type: TransportType = 'transit'): number {
  const R = 6371 // 지구 반지름 (km)
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

  let speed = 15 // 기본 속도 (km/h)
  let waitTime = 5 // 기본 대기 시간 (분)

  if (type === 'walk') {
    speed = 4.5
    waitTime = 0
  } else if (type === 'taxi') {
    speed = 25
    waitTime = 3
  } else if (type === 'transit') {
    speed = 20
    waitTime = 8
  }

  return Math.max(1, Math.round((realDist / speed) * 60 + waitTime))
}
