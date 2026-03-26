import PlaceCategorySection from './PlaceCategorySection'
import PlaceList from './PlaceList'
import type { Trip, TripDetailItem } from './PlaceSearchSection'

interface PlaceResultSectionProps {
<<<<<<< HEAD
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
=======
  keyword: string
  places: Place[]
<<<<<<< HEAD
<<<<<<< HEAD
=======
  trendingPlaces: Place[]
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)
>>>>>>> 56c7bc4 (카테고리 수정)
  isLoading?: boolean
  errorMessage?: string
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function PlaceResultSection({
<<<<<<< HEAD
  trips,
  tripDetailsMap,
=======
  keyword,
  places,
<<<<<<< HEAD
<<<<<<< HEAD
=======
  trendingPlaces,
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)
>>>>>>> 56c7bc4 (카테고리 수정)
  isLoading = false,
  errorMessage = '',
  selectedCategory,
  onSelectCategory,
}: PlaceResultSectionProps) {
  return (
    <section className="space-y-4">
      <PlaceCategorySection
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      {isLoading && (
        <p className="text-sm text-gray-500">일정을 불러오는 중입니다...</p>
      )}

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

<<<<<<< HEAD
      {!isLoading && !errorMessage && (
        <PlaceList trips={trips} tripDetailsMap={tripDetailsMap} />
      )}
=======
<<<<<<< HEAD
<<<<<<< HEAD
      {!isLoading && <PlaceList places={places} />}
=======
      {!isLoading && (
        <PlaceList places={hasKeyword ? places : trendingPlaces} />
      )}
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
      {!isLoading && <PlaceList places={places} />}
>>>>>>> 4986e65 (카테고리 수정)
>>>>>>> 56c7bc4 (카테고리 수정)
    </section>
  )
}
