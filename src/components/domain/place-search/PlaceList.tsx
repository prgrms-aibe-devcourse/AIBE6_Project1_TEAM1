import PlaceCard from './PlaceCard'

interface Place {
  id: string
  name: string
  address: string
  category: string
  categoryGroupName?: string
  phone?: string
  imageUrl?: string
}

interface PlaceListProps {
  places: Place[]
  selectedPlaceId?: string
  onSelectPlace?: (place: Place) => void
}

export default function PlaceList({
  places,
  selectedPlaceId,
  onSelectPlace,
}: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        검색 결과가 없습니다.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          isSelected={selectedPlaceId === place.id}
          onClick={() => onSelectPlace?.(place)}
        />
      ))}
    </div>
  )
}
