interface PlaceCardProps {
  place: {
    id: string
    name: string
    address: string
    category: string
    categoryGroupName?: string
    phone?: string
    imageUrl?: string
  }
  isSelected?: boolean
  onClick?: () => void
}

export default function PlaceCard({
  place,
  isSelected = false,
  onClick,
}: PlaceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all ${
        isSelected
          ? 'border-black ring-1 ring-black'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
          {place.name}
        </h3>

        {isSelected && (
          <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">주소:</span> {place.address}
              </p>

              <p>
                <span className="font-semibold">카테고리:</span>{' '}
                {place.category}
              </p>

              {place.categoryGroupName && (
                <p>
                  <span className="font-semibold">분류:</span>{' '}
                  {place.categoryGroupName}
                </p>
              )}

              {place.phone && (
                <p>
                  <span className="font-semibold">전화번호:</span> {place.phone}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
