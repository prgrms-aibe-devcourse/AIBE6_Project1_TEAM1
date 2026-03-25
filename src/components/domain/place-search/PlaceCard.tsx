interface PlaceCardProps {
  place: {
    id: string
    name: string
    address: string
    category: string
    rating?: number
  }
}

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
      <h3 className="text-base font-semibold">{place.name}</h3>
      <p className="mt-1 text-sm text-gray-600">{place.address}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">{place.category}</span>
        {place.rating !== undefined && (
          <span className="text-sm font-medium">⭐ {place.rating}</span>
        )}
      </div>
    </div>
  )
}
