'use client'

<<<<<<< HEAD
<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'
=======
<<<<<<< HEAD
>>>>>>> 459ade2 (feat: 검색기능 구현  입력값 라우팅 연결)
=======
<<<<<<< HEAD
>>>>>>> c901d24 (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import PlaceResultSection from './PlaceResultSection'
=======
import SearchBox from '@/components/layout/SearchBox'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlaceList from './PlaceList'
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
=======
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlaceCategorySection from './PlaceCategorySection'
import PlaceFilterBar from './PlaceFilterBar'
import PlaceResultSection from './PlaceResultSection'
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)

<<<<<<< HEAD
export interface Trip {
  id: number
  title: string | null
  start_date: string | null
  end_date: string | null
  is_public: boolean | null
  user_id?: string | null
=======
interface Place {
  id: string
  name: string
  address: string
  category: string
  rating?: number
<<<<<<< HEAD
  categoryGroupCode?: string
  categoryGroupName?: string
  placeUrl?: string
  phone?: string
  latitude?: number
  longitude?: number
>>>>>>> 459ade2 (feat: 검색기능 구현  입력값 라우팅 연결)
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
=======
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
}

interface KakaoPlaceDocument {
  id: string
  place_name: string
  road_address_name: string
  address_name: string
  category_name: string
}

const trendingPlaces: Place[] = [
  {
    id: '101',
    name: '제주 올레길 7코스',
    address: '제주 서귀포시',
    category: '자연/힐링',
    rating: 4.8,
  },
  {
    id: '102',
    name: '경주 역사 탐방',
    address: '경북 경주시',
    category: '문화/역사',
    rating: 4.6,
  },
  {
<<<<<<< HEAD
    id: '3',
    name: '서울숲',
    address: '서울 성동구 뚝섬로',
    category: '공원',
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
    rating: 4.7,
  },
  {
    id: '4',
    name: '강남2',
    address: '서울 성동구 뚝섬ㅇㅇ로',
    category: '공원',
=======
    id: '103',
    name: '전주 한옥마을',
    address: '전북 전주시',
    category: '맛집 투어',
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
    rating: 4.7,
  },
]

<<<<<<< HEAD
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
}

=======
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
export default function PlaceSearchSection() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('query') ?? ''

<<<<<<< HEAD
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripDetailsMap, setTripDetailsMap] = useState<
    Record<number, TripDetailItem[]>
  >({})
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption>('전체')
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
=======
  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
  const [selectedFilter, setSelectedFilter] = useState('전체')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
<<<<<<< HEAD

  const handleSearch = async (
    searchKeyword: string,
    categoryName: string = selectedCategory,
  ) => {
=======

  const handleSearch = (searchKeyword: string) => {
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
=======

  const handleSearch = async (searchKeyword: string) => {
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) {
      setPlaces([])
<<<<<<< HEAD
<<<<<<< HEAD
      setErrorMessage('')
>>>>>>> 459ade2 (feat: 검색기능 구현  입력값 라우팅 연결)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

      const trimmedKeyword = searchKeyword.trim()

      let tripsQuery = supabase
        .from('trips')
        .select('id, title, start_date, end_date, is_public, user_id')
        .order('start_date', { ascending: true })

      // 기존 제목 검색은 DB 쿼리에서 먼저 유지
      if (trimmedKeyword) {
        tripsQuery = tripsQuery.ilike('title', `%${trimmedKeyword}%`)
      }

      const { data: titleMatchedTrips, error: titleTripsError } =
        await tripsQuery

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
        setTrips([])
        setTripDetailsMap({})
        return
      }

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
          ? mergedTrips
          : mergedTrips.filter((trip) =>
              (nextTripDetailsMap[trip.id] ?? []).some(
                (item) => inferPlaceCategory(item.place?.category) === category,
              ),
            )

      setTrips(categoryFilteredTrips)
      setTripDetailsMap(nextTripDetailsMap)
    } catch (error) {
      console.error(error)
      setTrips([])
      setTripDetailsMap({})
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '일정 검색 중 오류가 발생했습니다.',
      )
    } finally {
      setIsLoading(false)
    }
=======
=======
      setErrorMessage('')
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

<<<<<<< HEAD
    setPlaces(filteredPlaces)
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
=======
      const response = await fetch(
        `/api/places?query=${encodeURIComponent(trimmedKeyword)}`,
        {
          method: 'GET',
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || '장소 검색 요청에 실패했습니다.')
      }

      const data = await response.json()

      const mappedPlaces: Place[] = (data.documents ?? []).map(
        (place: KakaoPlaceDocument) => ({
          id: place.id,
          name: place.place_name,
          address: place.road_address_name || place.address_name,
          category: place.category_name,
        }),
      )

      setPlaces(mappedPlaces)
    } catch (error) {
      console.error(error)
      setPlaces([])
      setErrorMessage('장소 검색 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
  }

  useEffect(() => {
<<<<<<< HEAD
    fetchTrips(queryFromUrl, selectedCategory)
  }, [queryFromUrl, selectedCategory])
=======
    setKeyword(queryFromUrl)
<<<<<<< HEAD
<<<<<<< HEAD

    if (queryFromUrl) {
      handleSearch(queryFromUrl, selectedCategory)
=======

    if (queryFromUrl) {
      handleSearch(queryFromUrl)
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
    } else {
      setPlaces([])
      setErrorMessage('')
    }
<<<<<<< HEAD
  }, [queryFromUrl])

  useEffect(() => {
    if (keyword.trim()) {
      handleSearch(keyword, selectedCategory)
    }
  }, [selectedCategory])

  const hasKeyword = keyword.trim().length > 0
>>>>>>> 459ade2 (feat: 검색기능 구현  입력값 라우팅 연결)

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <PlaceResultSection
        trips={trips}
        tripDetailsMap={tripDetailsMap}
        errorMessage={errorMessage}
        isLoading={isLoading}
        selectedCategory={selectedCategory}
        onSelectCategory={(category) =>
          setSelectedCategory(category as CategoryOption)
        }
      />
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
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
    </section>
  )
}
