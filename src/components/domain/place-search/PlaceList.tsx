import PlaceCard from './PlaceCard'
import type { Trip, TripDetailItem } from './PlaceSearchSection'

interface PlaceListProps {
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
}

export default function PlaceList({ trips, tripDetailsMap }: PlaceListProps) {
  if (trips.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        조건에 맞는 일정이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <PlaceCard
          key={trip.id}
          trip={trip}
          detailItems={tripDetailsMap[trip.id] ?? []}
        />
      ))}
    </div>
  )
}
