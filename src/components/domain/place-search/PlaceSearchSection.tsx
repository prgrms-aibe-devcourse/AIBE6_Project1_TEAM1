'use client'

<<<<<<< HEAD
<<<<<<< HEAD
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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

interface KakaoPlaceMeta {
  is_end: boolean
  pageable_count: number
  total_count: number
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
<<<<<<< HEAD
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
=======
>>>>>>> 7f759a7 (업데이트  place search section)
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
<<<<<<< HEAD
=======
>>>>>>> 474a18a (feat: 검색기능 구현  입력값 라우팅 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)
=======
const PAGE_SIZE = 15

>>>>>>> 3380091 (Feat: 페이지기능 구현)
export default function PlaceSearchSection() {
  const searchParams = useSearchParams()
  const queryFromUrl = searchParams.get('query') ?? ''
  const resultTopRef = useRef<HTMLDivElement | null>(null)

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

  const [currentPage, setCurrentPage] = useState(1)
  const [pageableCount, setPageableCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isEnd, setIsEnd] = useState(true)

  const scrollToResults = () => {
    if (resultTopRef.current) {
      resultTopRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const handleSearch = async (
    searchKeyword: string,
    categoryName: string = selectedCategory,
    page: number = 1,
    shouldScroll: boolean = false,
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
      setCurrentPage(1)
      setPageableCount(0)
      setTotalCount(0)
      setIsEnd(true)
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
<<<<<<< HEAD

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
        }),
      )

      setPlaces(mappedPlaces)
      setCurrentPage(page)
      setPageableCount(data.meta?.pageable_count ?? 0)
      setTotalCount(data.meta?.total_count ?? 0)
      setIsEnd(data.meta?.is_end ?? true)

      if (shouldScroll) {
        requestAnimationFrame(() => {
          scrollToResults()
        })
      }
    } catch (error) {
      console.error(error)
      setPlaces([])
      setCurrentPage(1)
      setPageableCount(0)
      setTotalCount(0)
      setIsEnd(true)
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
=======
    if (queryFromUrl.trim()) {
      handleSearch(queryFromUrl, selectedCategory, 1, false)
>>>>>>> 3380091 (Feat: 페이지기능 구현)
    } else {
      setPlaces([])
      setErrorMessage('')
      setCurrentPage(1)
      setPageableCount(0)
      setTotalCount(0)
      setIsEnd(true)
    }
<<<<<<< HEAD
  }, [queryFromUrl])

  useEffect(() => {
    if (keyword.trim()) {
      handleSearch(keyword, selectedCategory, 1, false)
    }
  }, [selectedCategory])

  const hasKeyword = keyword.trim().length > 0
  const totalPages = Math.ceil(pageableCount / PAGE_SIZE)

  const getVisiblePages = () => {
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    let startPage = Math.max(1, currentPage - 2)
    let endPage = startPage + maxVisiblePages - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = endPage - maxVisiblePages + 1
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index,
    )
  }

  const visiblePages = getVisiblePages()

  const handlePageChange = (page: number) => {
    if (!keyword.trim()) return
    if (page < 1 || page > totalPages) return
    if (page === currentPage) return

    handleSearch(keyword, selectedCategory, page, true)
  }

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
            disabled={isEnd || currentPage === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </div>
      )}
>>>>>>> 3380091 (Feat: 페이지기능 구현)
    </section>
  )
}
