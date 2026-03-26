interface PlaceFilterBarProps {
  selectedFilter: string
  onSelectFilter: (filter: string) => void
}

const filters = ['전체', '도보 여행', '대중교통', '당일치기']

export default function PlaceFilterBar({
  selectedFilter,
  onSelectFilter,
}: PlaceFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = selectedFilter === filter

        return (
          <button
            key={filter}
            type="button"
            onClick={() => onSelectFilter(filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        )
      })}
    </div>
  )
}
