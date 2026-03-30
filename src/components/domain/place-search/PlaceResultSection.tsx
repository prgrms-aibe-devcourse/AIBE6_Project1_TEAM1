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
  bookmarkedTripIds?: Set<number>
  onToggleBookmark?: (tripId: number) => void
  maxDistance?: number
  onDistanceChange?: (distance: number) => void
}

export default function PlaceResultSection({
  trips,
  tripDetailsMap,
  tripReviewSummaryMap,
  isLoading = false,
  errorMessage = '',
  selectedCategory,
  onSelectCategory,
  bookmarkedTripIds,
  onToggleBookmark,
  maxDistance = 50,
  onDistanceChange,
}: PlaceResultSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PlaceCategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
        <div className="flex items-center gap-3 w-full md:w-64 px-1 pb-1">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            거리: {maxDistance === 50 ? '50km+' : `${maxDistance}km 이하`}
          </span>
          <input 
            type="range" 
            min="1" 
            max="50" 
            step="1"
            value={maxDistance} 
            onChange={(e) => onDistanceChange?.(Number(e.target.value))} 
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500">일정을 불러오는 중입니다...</p>
      )}

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <PlaceList
          trips={trips}
          tripDetailsMap={tripDetailsMap}
          tripReviewSummaryMap={tripReviewSummaryMap}
          bookmarkedTripIds={bookmarkedTripIds}
          onToggleBookmark={onToggleBookmark}
        />
      )}
    </section>
  )
}
