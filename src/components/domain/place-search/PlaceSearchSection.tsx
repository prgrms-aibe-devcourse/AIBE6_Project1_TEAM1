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
  imageUrl?: string
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

interface KakaoPlaceMeta {
  is_end: boolean
  pageable_count: number
  total_count: number
}

const PAGE_SIZE = 9

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
}

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
}

function createPlaceholderImage(label: string, emoji: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f3f4f6" />
      <text x="50%" y="42%" text-anchor="middle" font-size="56">${emoji}</text>
      <text x="50%" y="62%" text-anchor="middle" font-size="24" fill="#111827" font-family="Arial, sans-serif">${label}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export default function PlaceSearchSection() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('query') ?? ''

  const [keyword, setKeyword] = useState('')
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('전체')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageableCount, setPageableCount] = useState(0)

  const handleSearch = async (
    searchKeyword: string,
    categoryName: string = selectedCategory,
    page: number = 1,
  ) => {
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) {
      setPlaces([])
      setSelectedPlace(null)
      setErrorMessage('')
      setCurrentPage(1)
      setPageableCount(0)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage('')

      const categoryGroupCode = CATEGORY_CODE_MAP[categoryName] ?? ''
      const query = new URLSearchParams({
        query: trimmedKeyword,
        page: String(page),
        size: String(PAGE_SIZE),
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

      const data: { documents?: KakaoPlaceDocument[]; meta?: KakaoPlaceMeta } =
        await response.json()

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
      )

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

      <PlaceResultSection
        keyword={keyword}
        places={hasKeyword ? places : trendingPlaces}
        selectedPlace={selectedPlace}
        onSelectPlace={(place) =>
          setSelectedPlace((prev) => (prev?.id === place.id ? null : place))
        }
        errorMessage={errorMessage}
        isLoading={isLoading}
      />

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
    </section>
  )
}
