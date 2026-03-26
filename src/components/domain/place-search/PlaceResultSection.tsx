import PlaceList from './PlaceList'

interface Place {
  id: string
  name: string
  address: string
  category: string
  rating?: number
}

interface PlaceResultSectionProps {
  keyword: string
  places: Place[]
  trendingPlaces: Place[]
  isLoading?: boolean
  errorMessage?: string
}

export default function PlaceResultSection({
  keyword,
  places,
  trendingPlaces,
  isLoading = false,
  errorMessage = '',
}: PlaceResultSectionProps) {
  const hasKeyword = keyword.trim().length > 0

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">
          {hasKeyword ? '검색 결과' : '지금 뜨는 여행지'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {hasKeyword
            ? `"${keyword}"에 대한 장소를 보여드릴게요.`
            : '지금 인기 있는 여행지를 둘러보세요.'}
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500">장소를 검색 중입니다...</p>
      )}

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      {!isLoading && (
        <PlaceList places={hasKeyword ? places : trendingPlaces} />
      )}
    </section>
  )
}
