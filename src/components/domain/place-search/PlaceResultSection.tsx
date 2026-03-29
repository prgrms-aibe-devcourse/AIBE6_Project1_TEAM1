import PlaceCategorySection from './PlaceCategorySection'
import PlaceList from './PlaceList'
import type {
  Trip,
  TripDetailItem,
  TripReviewSummary,
} from './PlaceSearchSection'

interface PlaceResultSectionProps {
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
  tripReviewSummaryMap: Record<number, TripReviewSummary>
  isLoading?: boolean
  errorMessage?: string
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function PlaceResultSection({
  trips,
  tripDetailsMap,
  tripReviewSummaryMap,
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

      {!isLoading && !errorMessage && (
        <PlaceList
          trips={trips}
          tripDetailsMap={tripDetailsMap}
          tripReviewSummaryMap={tripReviewSummaryMap}
        />
      )}
    </section>
  )
}
