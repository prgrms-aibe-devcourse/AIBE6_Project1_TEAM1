'use client'

<<<<<<< HEAD
<<<<<<< HEAD
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlaceCategorySection from './PlaceCategorySection'
import PlaceFilterBar from './PlaceFilterBar'
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

interface Place {
  id: string
  name: string
  address: string
  category: string
  rating?: number
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 4986e65 (카테고리 수정)
  categoryGroupCode?: string
  categoryGroupName?: string
  placeUrl?: string
  phone?: string
  latitude?: number
  longitude?: number
<<<<<<< HEAD
}

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
}

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
}

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
}

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
<<<<<<< HEAD
    category: '맛집 투어',
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
    category: '관광명소',
>>>>>>> 4986e65 (카테고리 수정)
    rating: 4.7,
  },
]

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 4986e65 (카테고리 수정)
const CATEGORY_CODE_MAP: Record<string, string> = {
  전체: '',
  관광명소: 'AT4',
  음식점: 'FD6',
  카페: 'CE7',
  숙박: 'AD5',
  문화시설: 'CT1',
  지하철역: 'SW8',
  주차장: 'PK6',
}

<<<<<<< HEAD
=======
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)
export default function PlaceSearchSection() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('query') ?? ''

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

<<<<<<< HEAD
  const handleSearch = async (searchKeyword: string) => {
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
  const handleSearch = async (
    searchKeyword: string,
    categoryName: string = selectedCategory,
  ) => {
>>>>>>> 4986e65 (카테고리 수정)
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) {
      setPlaces([])
<<<<<<< HEAD
<<<<<<< HEAD
      setErrorMessage('')
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

      const categoryGroupCode = CATEGORY_CODE_MAP[categoryName] ?? ''
      const query = new URLSearchParams({
        query: trimmedKeyword,
      })

      if (categoryGroupCode) {
        query.set('categoryGroupCode', categoryGroupCode)
      }

      const response = await fetch(`/api/places?${query.toString()}`, {
        method: 'GET',
        cache: 'no-store',
      })
<<<<<<< HEAD

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
          categoryGroupCode: place.category_group_code,
          categoryGroupName: place.category_group_name,
          placeUrl: place.place_url,
          phone: place.phone,
          latitude: Number(place.y),
          longitude: Number(place.x),
        }),
      )

      setPlaces(mappedPlaces)
    } catch (error) {
      console.error(error)
      setPlaces([])
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '장소 검색 중 오류가 발생했습니다.',
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
=======
>>>>>>> 4986e65 (카테고리 수정)

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
          categoryGroupCode: place.category_group_code,
          categoryGroupName: place.category_group_name,
          placeUrl: place.place_url,
          phone: place.phone,
          latitude: Number(place.y),
          longitude: Number(place.x),
        }),
      )

      setPlaces(mappedPlaces)
    } catch (error) {
      console.error(error)
      setPlaces([])
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '장소 검색 중 오류가 발생했습니다.',
      )
    } finally {
      setIsLoading(false)
    }
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
  }

  useEffect(() => {
    setKeyword(queryFromUrl)
<<<<<<< HEAD
<<<<<<< HEAD

    if (queryFromUrl) {
      handleSearch(queryFromUrl, selectedCategory)
=======

    if (queryFromUrl) {
<<<<<<< HEAD
      handleSearch(queryFromUrl)
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
      handleSearch(queryFromUrl, selectedCategory)
>>>>>>> 4986e65 (카테고리 수정)
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

      <PlaceResultSection
        keyword={keyword}
        places={hasKeyword ? places : trendingPlaces}
<<<<<<< HEAD
        errorMessage={errorMessage}
        isLoading={isLoading}
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
=======
>>>>>>> 4986e65 (카테고리 수정)
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
    </section>
  )
}
