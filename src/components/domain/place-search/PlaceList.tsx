import PlaceCard from './PlaceCard'

interface Place {
  id: string
  name: string
  address: string
  category: string
  rating?: number
}

interface PlaceListProps {
  places: Place[]
}

export default function PlaceList({ places }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        검색 결과가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} />
      ))}
    </div>
  )
}
