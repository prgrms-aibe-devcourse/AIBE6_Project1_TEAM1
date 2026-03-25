'use client'

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
}

const dummyPlaces: Place[] = [
  {
    id: '1',
    name: '강남역',
    address: '서울 강남구 강남대로',
    category: '지하철역',
    rating: 4.3,
  },
  {
    id: '2',
    name: '코엑스',
    address: '서울 강남구 영동대로',
    category: '쇼핑몰',
    rating: 4.5,
  },
  {
    id: '3',
    name: '서울숲',
    address: '서울 성동구 뚝섬로',
    category: '공원',
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
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
}

=======
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
export default function PlaceSearchSection() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('query') ?? ''

  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
<<<<<<< HEAD
  const [selectedFilter, setSelectedFilter] = useState('전체')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (
    searchKeyword: string,
    categoryName: string = selectedCategory,
  ) => {
=======

  const handleSearch = (searchKeyword: string) => {
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) {
      setPlaces([])
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
      return
    }

    const filteredPlaces = dummyPlaces.filter((place) =>
      place.name.includes(trimmedKeyword),
    )

    setPlaces(filteredPlaces)
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
  }

  useEffect(() => {
    setKeyword(queryFromUrl)
<<<<<<< HEAD

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
=======
    handleSearch(queryFromUrl)
  }, [queryFromUrl])

  return (
    <section className="space-y-4">
      <SearchBox
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(keyword)
          }
        }}
        placeholder="장소를 검색해보세요"
      />

      <PlaceList places={places} />
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
    </section>
  )
}
