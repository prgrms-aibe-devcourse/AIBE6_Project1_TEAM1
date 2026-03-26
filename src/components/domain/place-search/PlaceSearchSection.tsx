'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlaceCategorySection from './PlaceCategorySection'
import PlaceFilterBar from './PlaceFilterBar'
import PlaceResultSection from './PlaceResultSection'

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
    rating: 4.7,
  },
  {
    id: '4',
    name: '강남2',
    address: '서울 성동구 뚝섬ㅇㅇ로',
    category: '공원',
    rating: 4.7,
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
}

export default function PlaceSearchSection() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('query') ?? ''

  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedFilter, setSelectedFilter] = useState('전체')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (
    searchKeyword: string,
    categoryName: string = selectedCategory,
  ) => {
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) {
      setPlaces([])
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
  }

  useEffect(() => {
    setKeyword(queryFromUrl)

    if (queryFromUrl) {
      handleSearch(queryFromUrl, selectedCategory)
    } else {
      setPlaces([])
      setErrorMessage('')
    }
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
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
    </section>
  )
}
