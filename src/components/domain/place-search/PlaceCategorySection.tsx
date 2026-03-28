interface PlaceCategorySectionProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

const categories = [
  '전체',
  '음식점',
  '카페',
  '숙박',
  '관광명소',
  '문화시설',
  '당일치기',
]

export default function PlaceCategorySection({
  selectedCategory,
  onSelectCategory,
}: PlaceCategorySectionProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-3 pb-1">
        {categories.map((category) => {
          const isActive = selectedCategory === category

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold shadow-sm transition-all ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'border border-purple-200 bg-white text-purple-700 hover:bg-purple-50'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>
    </div>
  )
}
