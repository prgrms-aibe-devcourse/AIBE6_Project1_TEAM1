interface PlaceCategorySectionProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

const categories = [
  '전체',
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 4986e65 (카테고리 수정)
  '관광명소',
  '음식점',
  '카페',
  '숙박',
  '문화시설',
  '지하철역',
<<<<<<< HEAD
=======
  '자연/힐링',
  '문화/역사',
  '맛집 투어',
  '도심 산책',
  '해안 코스',
  '축제/행사',
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)
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
<<<<<<< HEAD
<<<<<<< HEAD
                ? 'border-gray-900 bg-gray-900 text-white'
=======
                ? 'border-black bg-black text-white'
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
                ? 'border-gray-900 bg-gray-900 text-white'
>>>>>>> 4986e65 (카테고리 수정)
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
