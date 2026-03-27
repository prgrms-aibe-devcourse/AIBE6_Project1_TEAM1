'use client'

<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
=======
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
import { createClient } from '@supabase/supabase-js'
import { useSearchParams } from 'next/navigation'
<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react'
=======
import { useEffect, useRef, useState } from 'react'
import PlaceCategorySection from './PlaceCategorySection'
import PlaceFilterBar from './PlaceFilterBar'
>>>>>>> 6539aea (Feat: 페이지기능 구현)
import PlaceResultSection from './PlaceResultSection'
<<<<<<< HEAD
=======
=======
import SearchBox from '@/components/layout/SearchBox'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlaceList from './PlaceList'
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
=======
=======
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
=======
import { createClient } from '@supabase/supabase-js'
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import PlaceResultSection from './PlaceResultSection'
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)

<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
export interface Trip {
  id: number
  title: string | null
  start_date: string | null
  end_date: string | null
  is_public: boolean | null
  user_id?: string | null
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
=======
interface Place {
  id: string
  name: string
  address: string
  category: string
  rating?: number
  categoryGroupCode?: string
  categoryGroupName?: string
  placeUrl?: string
  phone?: string
  latitude?: number
  longitude?: number
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 459ade2 (feat: 검색기능 구현  입력값 라우팅 연결)
=======
<<<<<<< HEAD
>>>>>>> 56c7bc4 (카테고리 수정)
=======
  imageUrl?: string
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
}

export interface TripItem {
  id: number
  trip_id: number
  place_id: number
  visit_order: number | null
  transport_type: string | null
  travel_time: number | null
  visit_day: number | null
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> faceb22 (Feat: 페이지기능 구현)
export interface Place {
  id: number
  kakao_place_id: string | null
  place_name: string | null
  category: string | null
  latitude: number | null
  longitude: number | null
  is_near_station: boolean | null
  address: string | null
  displayCategory?: string | null
}

export interface TripDetailItem extends TripItem {
  place: Place | null
}

const CATEGORY_OPTIONS = [
  '전체',
  '음식점',
  '카페',
  '숙박',
  '관광명소',
  '문화시설',
] as const

type CategoryOption = (typeof CATEGORY_OPTIONS)[number]

function inferPlaceCategory(
  rawCategory?: string | null,
): CategoryOption | null {
  const category = (rawCategory ?? '').toLowerCase()

  if (!category) return null

  if (
    category.includes('카페') ||
    category.includes('커피') ||
    category.includes('디저트') ||
    category.includes('베이커리')
  ) {
    return '카페'
  }

  if (
    category.includes('음식점') ||
    category.includes('식당') ||
    category.includes('맛집') ||
    category.includes('한식') ||
    category.includes('중식') ||
    category.includes('일식') ||
    category.includes('양식') ||
    category.includes('분식') ||
    category.includes('치킨') ||
    category.includes('피자') ||
    category.includes('햄버거')
  ) {
    return '음식점'
  }

  if (
    category.includes('호텔') ||
    category.includes('모텔') ||
    category.includes('펜션') ||
    category.includes('게스트하우스') ||
    category.includes('리조트') ||
    category.includes('숙박')
  ) {
    return '숙박'
  }

  if (
    category.includes('박물관') ||
    category.includes('미술관') ||
    category.includes('공연') ||
    category.includes('전시') ||
    category.includes('문화시설') ||
    category.includes('도서관')
  ) {
    return '문화시설'
  }

  if (
    category.includes('관광') ||
    category.includes('공원') ||
    category.includes('해수욕장') ||
    category.includes('산') ||
    category.includes('전망대') ||
    category.includes('테마파크') ||
    category.includes('랜드마크') ||
    category.includes('명소')
  ) {
    return '관광명소'
  }

  return null
}

function includesKeyword(value: string | null | undefined, keyword: string) {
  if (!value) return false
  return value.toLowerCase().includes(keyword.toLowerCase())
<<<<<<< HEAD
=======
=======
=======
interface KakaoPlaceMeta {
  is_end: boolean
  pageable_count: number
  total_count: number
}

<<<<<<< HEAD
>>>>>>> 6539aea (Feat: 페이지기능 구현)
const trendingPlaces: Place[] = [
  {
    id: '101',
    name: '제주 올레길 7코스',
    address: '제주 서귀포시',
    category: '관광명소',
    rating: 4.8,
  },
  {
    id: '102',
    name: '경주 역사 탐방',
    address: '경북 경주시',
    category: '문화시설',
    rating: 4.6,
  },
  {
    id: '103',
    name: '전주 한옥마을',
    address: '전북 전주시',
    category: '관광명소',
=======
=======
>>>>>>> 4986e65 (카테고리 수정)
<<<<<<< HEAD
>>>>>>> faceb22 (Feat: 페이지기능 구현)
}

<<<<<<< HEAD
=======
interface KakaoPlaceDocument {
  id: string
  place_name: string
  road_address_name: string
  address_name: string
  category_name: string
  category_group_code: string
  category_group_name: string
  place_url: string
  phone: string
  x: string
  y: string
=======
=======
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
}

export interface TripItem {
  id: number
  trip_id: number
  place_id: number
  visit_order: number | null
  transport_type: string | null
  travel_time: number | null
  visit_day: number | null
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
}
<<<<<<< HEAD
=======
const PAGE_SIZE = 9
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)

const trendingPlaces: Place[] = [
  {
    id: '101',
    name: '제주 올레길 7코스',
    address: '제주 서귀포시',
    category: '관광명소',
    rating: 4.8,
    imageUrl: createPlaceholderImage('관광명소', '🧳'),
  },
  {
    id: '102',
    name: '경주 역사 탐방',
    address: '경북 경주시',
    category: '문화시설',
    rating: 4.6,
    imageUrl: createPlaceholderImage('문화시설', '🏛️'),
  },
  {
    id: '103',
    name: '전주 한옥마을',
    address: '전북 전주시',
    category: '관광명소',
    rating: 4.7,
    imageUrl: createPlaceholderImage('관광명소', '📍'),
  },
]

const CATEGORY_CODE_MAP: Record<string, string> = {
  전체: '',
  관광명소: 'AT4',
  음식점: 'FD6',
  카페: 'CE7',
  숙박: 'AD5',
  문화시설: 'CT1',
  지하철역: 'SW8',
  주차장: 'PK6',
>>>>>>> 459ade2 (feat: 검색기능 구현  입력값 라우팅 연결)
=======

export interface Place {
  id: number
  kakao_place_id: string | null
  place_name: string | null
  category: string | null
  latitude: number | null
  longitude: number | null
  is_near_station: boolean | null
  address: string | null
  displayCategory?: string | null
}

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)
<<<<<<< HEAD
>>>>>>> 61b4c13 (업데이트  place search section)
=======
=======
const PAGE_SIZE = 15

>>>>>>> 3380091 (Feat: 페이지기능 구현)
>>>>>>> faceb22 (Feat: 페이지기능 구현)
=======
function getCategoryEmoji(category: string, groupName?: string) {
  const source = `${category} ${groupName ?? ''}`

  if (source.includes('카페')) return '☕'
  if (source.includes('음식점')) return '🍽️'
  if (source.includes('숙박')) return '🏨'
  if (source.includes('문화시설')) return '🏛️'
  if (source.includes('관광명소')) return '🧳'
  if (source.includes('지하철')) return '🚇'
  if (source.includes('주차장')) return '🅿️'
  return '📍'
=======
export interface TripDetailItem extends TripItem {
  place: Place | null
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
}

const CATEGORY_OPTIONS = [
  '전체',
  '음식점',
  '카페',
  '숙박',
  '관광명소',
  '문화시설',
] as const

type CategoryOption = (typeof CATEGORY_OPTIONS)[number]

function inferPlaceCategory(
  rawCategory?: string | null,
): CategoryOption | null {
  const category = (rawCategory ?? '').toLowerCase()

  if (!category) return null

  if (
    category.includes('카페') ||
    category.includes('커피') ||
    category.includes('디저트') ||
    category.includes('베이커리')
  ) {
    return '카페'
  }

  if (
    category.includes('음식점') ||
    category.includes('식당') ||
    category.includes('맛집') ||
    category.includes('한식') ||
    category.includes('중식') ||
    category.includes('일식') ||
    category.includes('양식') ||
    category.includes('분식') ||
    category.includes('치킨') ||
    category.includes('피자') ||
    category.includes('햄버거')
  ) {
    return '음식점'
  }

  if (
    category.includes('호텔') ||
    category.includes('모텔') ||
    category.includes('펜션') ||
    category.includes('게스트하우스') ||
    category.includes('리조트') ||
    category.includes('숙박')
  ) {
    return '숙박'
  }

  if (
    category.includes('박물관') ||
    category.includes('미술관') ||
    category.includes('공연') ||
    category.includes('전시') ||
    category.includes('문화시설') ||
    category.includes('도서관')
  ) {
    return '문화시설'
  }

  if (
    category.includes('관광') ||
    category.includes('공원') ||
    category.includes('해수욕장') ||
    category.includes('산') ||
    category.includes('전망대') ||
    category.includes('테마파크') ||
    category.includes('랜드마크') ||
    category.includes('명소')
  ) {
    return '관광명소'
  }

  return null
}

<<<<<<< HEAD
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
=======
function includesKeyword(value: string | null | undefined, keyword: string) {
  if (!value) return false
  return value.toLowerCase().includes(keyword.toLowerCase())
}

>>>>>>> 8c5d052 (Feat: 검색로직 추가)
export default function PlaceSearchSection() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('query') ?? ''

<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripDetailsMap, setTripDetailsMap] = useState<
    Record<number, TripDetailItem[]>
  >({})
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption>('전체')
<<<<<<< HEAD
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return null
    }

    return createClient(supabaseUrl, supabaseAnonKey)
  }, [])

  const fetchTrips = async (
    searchKeyword = '',
    category: CategoryOption = selectedCategory,
  ) => {
    if (!supabase) {
      setTrips([])
      setTripDetailsMap({})
      setErrorMessage('Supabase 환경변수가 설정되지 않았습니다.')
<<<<<<< HEAD
=======
=======
  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('전체')
  const [selectedCategory, setSelectedCategory] = useState('전체')
=======
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return null
    }

    return createClient(supabaseUrl, supabaseAnonKey)
  }, [])

  const fetchTrips = async (
    searchKeyword = '',
    category: CategoryOption = selectedCategory,
  ) => {
<<<<<<< HEAD
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) {
      setPlaces([])
      setSelectedPlace(null)
      setErrorMessage('')
<<<<<<< HEAD
>>>>>>> 459ade2 (feat: 검색기능 구현  입력값 라우팅 연결)
=======
      setCurrentPage(1)
      setPageableCount(0)
<<<<<<< HEAD
      setTotalCount(0)
      setIsEnd(true)
>>>>>>> 6539aea (Feat: 페이지기능 구현)
<<<<<<< HEAD
>>>>>>> faceb22 (Feat: 페이지기능 구현)
=======
=======
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
<<<<<<< HEAD
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
=======
=======
    if (!supabase) {
      setTrips([])
      setTripDetailsMap({})
      setErrorMessage('Supabase 환경변수가 설정되지 않았습니다.')
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      const trimmedKeyword = searchKeyword.trim()
=======
      const categoryGroupCode = CATEGORY_CODE_MAP[categoryName] ?? ''
      const query = new URLSearchParams({
        query: trimmedKeyword,
        page: String(page),
        size: String(PAGE_SIZE),
      })
>>>>>>> 6539aea (Feat: 페이지기능 구현)

      let tripsQuery = supabase
        .from('trips')
        .select('id, title, start_date, end_date, is_public, user_id')
        .order('start_date', { ascending: true })

      // 기존 제목 검색은 DB 쿼리에서 먼저 유지
=======
=======
      const trimmedKeyword = searchKeyword.trim()

>>>>>>> 5d856d0 (Feat: 검색로직 추가)
      let tripsQuery = supabase
        .from('trips')
        .select('id, title, start_date, end_date, is_public, user_id')
        .order('start_date', { ascending: true })

<<<<<<< HEAD
      const trimmedKeyword = searchKeyword.trim()

>>>>>>> b807596 (Feat: 검색로직 전면 수정)
=======
      // 기존 제목 검색은 DB 쿼리에서 먼저 유지
>>>>>>> 5d856d0 (Feat: 검색로직 추가)
      if (trimmedKeyword) {
        tripsQuery = tripsQuery.ilike('title', `%${trimmedKeyword}%`)
      }

<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
=======
>>>>>>> 8c5d052 (Feat: 검색로직 추가)
      const { data: titleMatchedTrips, error: titleTripsError } =
        await tripsQuery
<<<<<<< HEAD
=======
=======
      const response = await fetch(`/api/places?${query.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      })
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 56c7bc4 (카테고리 수정)
=======
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)

      if (titleTripsError) throw titleTripsError

      // 장소명/주소 매칭을 위해 전체 trips도 한 번 가져옴
      const { data: allTripsRows, error: allTripsError } = await supabase
        .from('trips')
        .select('id, title, start_date, end_date, is_public, user_id')
        .order('start_date', { ascending: true })

      if (allTripsError) throw allTripsError

      const allTrips = allTripsRows ?? []
      const allTripIds = allTrips.map((trip) => trip.id)

      if (allTripIds.length === 0) {
=======
      const { data: tripRows, error: tripsError } = await tripsQuery
=======
      const { data: titleMatchedTrips, error: titleTripsError } =
        await tripsQuery
>>>>>>> 5d856d0 (Feat: 검색로직 추가)

      if (titleTripsError) throw titleTripsError

      // 장소명/주소 매칭을 위해 전체 trips도 한 번 가져옴
      const { data: allTripsRows, error: allTripsError } = await supabase
        .from('trips')
        .select('id, title, start_date, end_date, is_public, user_id')
        .order('start_date', { ascending: true })

<<<<<<< HEAD
      if (fetchedTrips.length === 0) {
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
=======
      if (allTripsError) throw allTripsError

      const allTrips = allTripsRows ?? []
      const allTripIds = allTrips.map((trip) => trip.id)

      if (allTripIds.length === 0) {
>>>>>>> 5d856d0 (Feat: 검색로직 추가)
        setTrips([])
        setTripDetailsMap({})
        return
      }

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      // 실제 테이블명이 trip_itemps면 여기만 바꿔
      const { data: tripItemsRows, error: tripItemsError } = await supabase
        .from('trip_items')
        .select(
          'id, trip_id, place_id, visit_order, transport_type, travel_time, visit_day',
        )
        .in('trip_id', allTripIds)
        .order('visit_day', { ascending: true })
        .order('visit_order', { ascending: true })
=======
      const data: { documents?: KakaoPlaceDocument[]; meta?: KakaoPlaceMeta } =
        await response.json()
>>>>>>> 6539aea (Feat: 페이지기능 구현)

<<<<<<< HEAD
      if (tripItemsError) throw tripItemsError

      const tripItems = tripItemsRows ?? []
      const placeIds = [...new Set(tripItems.map((item) => item.place_id))]

      let placeMap = new Map<number, Place>()

      if (placeIds.length > 0) {
        const { data: placeRows, error: placesError } = await supabase
          .from('places')
          .select(
            'id, kakao_place_id, place_name, category, latitude, longitude, is_near_station, address',
          )
          .in('id', placeIds)

        if (placesError) throw placesError

        placeMap = new Map(
          (placeRows ?? []).map((place) => [
            place.id,
            {
              ...place,
              displayCategory:
                inferPlaceCategory(place.category) ?? place.category,
            },
          ]),
        )
      }

      const nextTripDetailsMap: Record<number, TripDetailItem[]> = {}

      tripItems.forEach((item) => {
        const place = placeMap.get(item.place_id) ?? null

        if (!nextTripDetailsMap[item.trip_id]) {
          nextTripDetailsMap[item.trip_id] = []
        }

        nextTripDetailsMap[item.trip_id].push({
          ...item,
          place,
        })
      })

      // 장소명/주소 기준 검색으로 걸리는 trip id 찾기
      const placeMatchedTripIds = new Set<number>()

      if (trimmedKeyword) {
        allTrips.forEach((trip) => {
          const detailItems = nextTripDetailsMap[trip.id] ?? []

          const hasPlaceMatch = detailItems.some((item) => {
            return (
              includesKeyword(item.place?.place_name, trimmedKeyword) ||
              includesKeyword(item.place?.address, trimmedKeyword)
            )
          })

          if (hasPlaceMatch) {
            placeMatchedTripIds.add(trip.id)
          }
        })
      }

      // 기존 제목 검색 결과 유지 + 장소명/주소 검색 결과 추가
      const titleMatchedIds = new Set(
        (titleMatchedTrips ?? []).map((trip) => trip.id),
=======
      const mappedPlaces: Place[] = (data.documents ?? []).map(
        (place: KakaoPlaceDocument) => ({
          id: place.id,
          name: place.place_name,
          address: place.road_address_name || place.address_name,
          category: place.category_name,
          categoryGroupCode: place.category_group_code,
          categoryGroupName: place.category_group_name,
          placeUrl: place.place_url,
          phone: place.phone,
          latitude: Number(place.y),
          longitude: Number(place.x),
          imageUrl: createPlaceholderImage(
            place.category_group_name || place.category_name,
            getCategoryEmoji(place.category_name, place.category_group_name),
          ),
        }),
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
      )

<<<<<<< HEAD
      const mergedTrips = trimmedKeyword
        ? allTrips.filter(
            (trip) =>
              titleMatchedIds.has(trip.id) || placeMatchedTripIds.has(trip.id),
          )
        : allTrips

      // 카테고리 필터는 기존처럼 유지
      const categoryFilteredTrips =
        category === '전체'
          ? mergedTrips
          : mergedTrips.filter((trip) =>
=======
      const tripIds = fetchedTrips.map((trip) => trip.id)

=======
>>>>>>> 5d856d0 (Feat: 검색로직 추가)
      // 실제 테이블명이 trip_itemps면 여기만 바꿔
      const { data: tripItemsRows, error: tripItemsError } = await supabase
        .from('trip_items')
        .select(
          'id, trip_id, place_id, visit_order, transport_type, travel_time, visit_day',
        )
        .in('trip_id', allTripIds)
        .order('visit_day', { ascending: true })
        .order('visit_order', { ascending: true })

      if (tripItemsError) throw tripItemsError

      const tripItems = tripItemsRows ?? []
      const placeIds = [...new Set(tripItems.map((item) => item.place_id))]

      let placeMap = new Map<number, Place>()

      if (placeIds.length > 0) {
        const { data: placeRows, error: placesError } = await supabase
          .from('places')
          .select(
            'id, kakao_place_id, place_name, category, latitude, longitude, is_near_station, address',
          )
          .in('id', placeIds)

        if (placesError) throw placesError

        placeMap = new Map(
          (placeRows ?? []).map((place) => [
            place.id,
            {
              ...place,
              displayCategory:
                inferPlaceCategory(place.category) ?? place.category,
            },
          ]),
        )
      }

      const nextTripDetailsMap: Record<number, TripDetailItem[]> = {}

      tripItems.forEach((item) => {
        const place = placeMap.get(item.place_id) ?? null

        if (!nextTripDetailsMap[item.trip_id]) {
          nextTripDetailsMap[item.trip_id] = []
        }

        nextTripDetailsMap[item.trip_id].push({
          ...item,
          place,
        })
      })

      // 장소명/주소 기준 검색으로 걸리는 trip id 찾기
      const placeMatchedTripIds = new Set<number>()

      if (trimmedKeyword) {
        allTrips.forEach((trip) => {
          const detailItems = nextTripDetailsMap[trip.id] ?? []

          const hasPlaceMatch = detailItems.some((item) => {
            return (
              includesKeyword(item.place?.place_name, trimmedKeyword) ||
              includesKeyword(item.place?.address, trimmedKeyword)
            )
          })

          if (hasPlaceMatch) {
            placeMatchedTripIds.add(trip.id)
          }
        })
      }

      // 기존 제목 검색 결과 유지 + 장소명/주소 검색 결과 추가
      const titleMatchedIds = new Set(
        (titleMatchedTrips ?? []).map((trip) => trip.id),
      )

      const mergedTrips = trimmedKeyword
        ? allTrips.filter(
            (trip) =>
              titleMatchedIds.has(trip.id) || placeMatchedTripIds.has(trip.id),
          )
        : allTrips

      // 카테고리 필터는 기존처럼 유지
      const categoryFilteredTrips =
        category === '전체'
<<<<<<< HEAD
          ? fetchedTrips
          : fetchedTrips.filter((trip) =>
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
=======
          ? mergedTrips
          : mergedTrips.filter((trip) =>
>>>>>>> 5d856d0 (Feat: 검색로직 추가)
              (nextTripDetailsMap[trip.id] ?? []).some(
                (item) => inferPlaceCategory(item.place?.category) === category,
              ),
            )

<<<<<<< HEAD
<<<<<<< HEAD
      setTrips(categoryFilteredTrips)
      setTripDetailsMap(nextTripDetailsMap)
    } catch (error) {
      console.error(error)
      setTrips([])
      setTripDetailsMap({})
=======
      setPlaces(mappedPlaces)
      setSelectedPlace(null)
      setCurrentPage(page)
      setPageableCount(data.meta?.pageable_count ?? 0)
    } catch (error) {
      console.error(error)
      setPlaces([])
      setSelectedPlace(null)
      setCurrentPage(1)
      setPageableCount(0)
<<<<<<< HEAD
      setTotalCount(0)
      setIsEnd(true)
>>>>>>> 6539aea (Feat: 페이지기능 구현)
=======
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
=======
      setTrips(filteredTrips)
=======
      setTrips(categoryFilteredTrips)
>>>>>>> 5d856d0 (Feat: 검색로직 추가)
      setTripDetailsMap(nextTripDetailsMap)
    } catch (error) {
      console.error(error)
      setTrips([])
      setTripDetailsMap({})
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '일정 검색 중 오류가 발생했습니다.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
    fetchTrips(queryFromUrl, selectedCategory)
  }, [queryFromUrl, selectedCategory])
<<<<<<< HEAD
=======
=======
    setKeyword(queryFromUrl)

    if (queryFromUrl) {
      handleSearch(queryFromUrl, selectedCategory, 1)
    } else {
      setPlaces([])
      setSelectedPlace(null)
      setErrorMessage('')
      setCurrentPage(1)
      setPageableCount(0)
    }
  }, [queryFromUrl])

  useEffect(() => {
    if (keyword.trim()) {
      handleSearch(keyword, selectedCategory, 1)
    }
  }, [selectedCategory])

  const hasKeyword = keyword.trim().length > 0
<<<<<<< HEAD
>>>>>>> 459ade2 (feat: 검색기능 구현  입력값 라우팅 연결)
>>>>>>> faceb22 (Feat: 페이지기능 구현)

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
=======
  const totalPages = Math.ceil(pageableCount / PAGE_SIZE)

  const handlePageChange = (page: number) => {
    if (!keyword.trim()) return
    if (page < 1 || page > totalPages) return

    setSelectedPlace(null)
    handleSearch(keyword, selectedCategory, page)
  }

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <PlaceFilterBar
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

      <PlaceCategorySection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 6539aea (Feat: 페이지기능 구현)
=======
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
      <PlaceResultSection
        trips={trips}
        tripDetailsMap={tripDetailsMap}
<<<<<<< HEAD
=======
=======
        keyword={keyword}
        places={hasKeyword ? places : trendingPlaces}
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 56c7bc4 (카테고리 수정)
=======
        selectedPlace={selectedPlace}
        onSelectPlace={(place) =>
          setSelectedPlace((prev) => (prev?.id === place.id ? null : place))
        }
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
<<<<<<< HEAD
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
=======
=======
    fetchTrips(queryFromUrl, selectedCategory)
  }, [queryFromUrl, selectedCategory])

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <PlaceResultSection
        trips={trips}
        tripDetailsMap={tripDetailsMap}
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
        errorMessage={errorMessage}
        isLoading={isLoading}
        selectedCategory={selectedCategory}
        onSelectCategory={(category) =>
          setSelectedCategory(category as CategoryOption)
        }
      />
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
    handleSearch(queryFromUrl)
=======
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
  }, [queryFromUrl])

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <PlaceFilterBar
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

<<<<<<< HEAD
      <PlaceList places={places} />
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
=======
      <PlaceCategorySection
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <PlaceResultSection
        keyword={keyword}
        places={places}
        trendingPlaces={trendingPlaces}
=======
>>>>>>> 4986e65 (카테고리 수정)
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
      <div ref={resultTopRef} className="space-y-3">
        {hasKeyword && !errorMessage && (
          <div className="flex flex-col gap-1 rounded-xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-black">{totalCount}</span>개의
              검색 결과
            </p>
            <p className="text-sm text-gray-600">
              {totalPages > 0
                ? `${currentPage} / ${totalPages} 페이지`
                : '1 / 1 페이지'}
            </p>
          </div>
        )}

        <PlaceResultSection
          keyword={keyword}
          places={hasKeyword ? places : trendingPlaces}
          errorMessage={errorMessage}
          isLoading={isLoading}
        />
      </div>
=======
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)

      {hasKeyword && !isLoading && !errorMessage && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>

          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => handlePageChange(pageNumber)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                currentPage === pageNumber
                  ? 'bg-black text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
<<<<<<< HEAD
>>>>>>> 3380091 (Feat: 페이지기능 구현)
>>>>>>> faceb22 (Feat: 페이지기능 구현)
=======
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
=======
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
    </section>
  )
}
