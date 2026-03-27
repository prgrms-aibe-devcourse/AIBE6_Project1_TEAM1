import PlaceCategorySection from './PlaceCategorySection'
import PlaceList from './PlaceList'
<<<<<<< HEAD
import type { Trip, TripDetailItem } from './PlaceSearchSection'
=======

interface Place {
  id: string
  name: string
  address: string
  category: string
  categoryGroupName?: string
  phone?: string
  imageUrl?: string
}
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)

interface PlaceResultSectionProps {
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
<<<<<<< HEAD
=======
=======
  keyword: string
  places: Place[]
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
  trendingPlaces: Place[]
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)
>>>>>>> 56c7bc4 (카테고리 수정)
=======
  selectedPlace?: Place | null
  onSelectPlace?: (place: Place) => void
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
  isLoading?: boolean
  errorMessage?: string
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function PlaceResultSection({
  trips,
  tripDetailsMap,
<<<<<<< HEAD
=======
=======
  keyword,
  places,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
  trendingPlaces,
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)
>>>>>>> 56c7bc4 (카테고리 수정)
=======
  selectedPlace,
  onSelectPlace,
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
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
      {!isLoading && !errorMessage && (
        <PlaceList trips={trips} tripDetailsMap={tripDetailsMap} />
      )}
=======
<<<<<<< HEAD
<<<<<<< HEAD
      {!isLoading && <PlaceList places={places} />}
=======
=======
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
      {!isLoading && (
        <PlaceList
          places={places}
          selectedPlaceId={selectedPlace?.id}
          onSelectPlace={onSelectPlace}
        />
      )}
<<<<<<< HEAD
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
      {!isLoading && <PlaceList places={places} />}
>>>>>>> 4986e65 (카테고리 수정)
>>>>>>> 56c7bc4 (카테고리 수정)
=======
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
    </section>
  )
}
