interface PlaceCategorySectionProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

<<<<<<< HEAD
<<<<<<< HEAD
const categories = ['전체', '음식점', '카페', '숙박', '관광명소', '문화시설']
=======
const categories = [
  '전체',
  '관광명소',
  '음식점',
  '카페',
  '숙박',
  '문화시설',
  '지하철역',
]
>>>>>>> 56c7bc4 (카테고리 수정)
=======
const categories = ['전체', '음식점', '카페', '숙박', '관광명소', '문화시설']
>>>>>>> b807596 (Feat: 검색로직 전면 수정)

export default function PlaceCategorySection({
  selectedCategory,
  onSelectCategory,
}: PlaceCategorySectionProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-3 pb-1">
        {categories.map((category) => {
          const isActive = selectedCategory === category

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
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
<<<<<<< HEAD
=======
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
>>>>>>> 56c7bc4 (카테고리 수정)
=======
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
    </div>
  )
}
