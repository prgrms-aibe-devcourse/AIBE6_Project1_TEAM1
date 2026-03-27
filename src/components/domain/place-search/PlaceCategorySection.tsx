interface PlaceCategorySectionProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
const categories = ['전체', '음식점', '카페', '숙박', '관광명소', '문화시설']
=======
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
const categories = [
  '전체',
<<<<<<< HEAD
=======
  '관광명소',
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
  '음식점',
  '카페',
  '숙박',
  '관광명소',
  '문화시설',
<<<<<<< HEAD
  '당일치기',
=======
  '지하철역',
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
]
<<<<<<< HEAD
=======
>>>>>>> 56c7bc4 (카테고리 수정)
=======
const categories = ['전체', '음식점', '카페', '숙박', '관광명소', '문화시설']
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)

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
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
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
<<<<<<< HEAD
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
=======
=======
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
    </div>
  )
}
