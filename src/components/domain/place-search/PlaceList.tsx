import PlaceCard from './PlaceCard'
<<<<<<< HEAD
<<<<<<< HEAD
import type { Trip, TripDetailItem } from './PlaceSearchSection'

interface PlaceListProps {
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
}

export default function PlaceList({ trips, tripDetailsMap }: PlaceListProps) {
  if (trips.length === 0) {
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
=======
import type { Trip, TripDetailItem } from './PlaceSearchSection'
>>>>>>> b807596 (Feat: 검색로직 전면 수정)

interface PlaceListProps {
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
}

<<<<<<< HEAD
export default function PlaceList({
  places,
  selectedPlaceId,
  onSelectPlace,
}: PlaceListProps) {
  if (places.length === 0) {
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
=======
export default function PlaceList({ trips, tripDetailsMap }: PlaceListProps) {
  if (trips.length === 0) {
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        조건에 맞는 일정이 없습니다.
      </div>
    )
  }

  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="space-y-3">
      {trips.map((trip) => (
        <PlaceCard
          key={trip.id}
          trip={trip}
          detailItems={tripDetailsMap[trip.id] ?? []}
=======
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          isSelected={selectedPlaceId === place.id}
          onClick={() => onSelectPlace?.(place)}
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
=======
    <div className="space-y-3">
      {trips.map((trip) => (
        <PlaceCard
          key={trip.id}
          trip={trip}
          detailItems={tripDetailsMap[trip.id] ?? []}
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
        />
      ))}
    </div>
  )
}
