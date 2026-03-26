interface PlaceCategorySectionProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

const categories = [
  '전체',
  '관광명소',
  '음식점',
  '카페',
  '숙박',
  '문화시설',
  '지하철역',
]

export default function PlaceCategorySection({
  selectedCategory,
  onSelectCategory,
}: PlaceCategorySectionProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => {
        const isActive = selectedCategory === category

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`rounded-2xl border px-4 py-4 text-sm font-medium text-left transition ${
              isActive
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
