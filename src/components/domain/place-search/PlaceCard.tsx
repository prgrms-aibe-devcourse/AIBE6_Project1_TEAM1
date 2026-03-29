'use client'

import {
  Bookmark,
  Clock3,
  CreditCard,
  Flame,
  MapPin,
  Route,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type {
  Trip,
  TripDetailItem,
  TripReviewSummary,
} from './PlaceSearchSection'

interface PlaceCardProps {
  trip: Trip
  detailItems: TripDetailItem[]
  reviewSummary: TripReviewSummary
  isHot?: boolean
}

function formatTravelTime(value?: number | null) {
  if (value == null) return '정보 없음'

  if (value < 60) return `약 ${value}분`

  const hour = Math.floor(value / 60)
  const minute = value % 60

  if (minute === 0) return `약 ${hour}시간`
  return `약 ${hour}시간 ${minute}분`
}

function formatDistance(value?: number | null) {
  if (value == null) return '정보 없음'
  return `${value.toLocaleString()}km`
}

function formatCost(value?: number | null) {
  if (value == null) return '정보 없음'
  return `${value.toLocaleString()}원`
}

function inferMainCategory(detailItems: TripDetailItem[]) {
  const categories = detailItems
    .map((item) => item.place?.category ?? '')
    .join(' ')

  if (
    categories.includes('카페') ||
    categories.includes('커피') ||
    categories.includes('디저트') ||
    categories.includes('베이커리')
  ) {
    return '카페 코스'
  }

  if (
    categories.includes('음식점') ||
    categories.includes('식당') ||
    categories.includes('맛집') ||
    categories.includes('한식') ||
    categories.includes('중식') ||
    categories.includes('일식') ||
    categories.includes('양식') ||
    categories.includes('분식')
  ) {
    return '맛집 코스'
  }

  if (
    categories.includes('해수욕장') ||
    categories.includes('바다') ||
    categories.includes('해변') ||
    categories.includes('해안')
  ) {
    return '해안 산책'
  }

  if (
    categories.includes('공원') ||
    categories.includes('관광') ||
    categories.includes('명소') ||
    categories.includes('전망대')
  ) {
    return '관광 코스'
  }

  return '추천 코스'
}

function buildTags(detailItems: TripDetailItem[]) {
  const raw = detailItems
    .map((item) => item.place?.category ?? '')
    .filter(Boolean)

  const mapped = raw.map((category) => {
    if (
      category.includes('카페') ||
      category.includes('커피') ||
      category.includes('디저트') ||
      category.includes('베이커리')
    ) {
      return '카페'
    }

    if (
      category.includes('음식점') ||
      category.includes('식당') ||
      category.includes('맛집') ||
      category.includes('한식') ||
      category.includes('중식') ||
      category.includes('일식') ||
      category.includes('양식') ||
      category.includes('분식')
    ) {
      return '맛집'
    }

    if (
      category.includes('공원') ||
      category.includes('관광') ||
      category.includes('명소') ||
      category.includes('전망대')
    ) {
      return '여행'
    }

    if (
      category.includes('해수욕장') ||
      category.includes('바다') ||
      category.includes('해변') ||
      category.includes('해안')
    ) {
      return '바다'
    }

    return category.split('>').pop()?.trim() || category
  })

  return [...new Set(mapped)].slice(0, 3)
}

function buildFeatureBadges(detailItems: TripDetailItem[]) {
  const categoriesText = detailItems
    .map((item) => item.place?.category ?? '')
    .join(' ')

  const badges: string[] = []

  if (
    categoriesText.includes('공원') ||
    categoriesText.includes('산책') ||
    categoriesText.includes('해안') ||
    categoriesText.includes('해변')
  ) {
    badges.push('평지')
  }

  if (
    categoriesText.includes('공원') ||
    categoriesText.includes('해안') ||
    categoriesText.includes('바다')
  ) {
    badges.push('계단 없음')
  }

  if (
    categoriesText.includes('카페') ||
    categoriesText.includes('실내') ||
    categoriesText.includes('복합')
  ) {
    badges.push('그늘 충분함')
  }

  return badges.slice(0, 3)
}

function getLocationLabel(detailItems: TripDetailItem[]) {
  const address = detailItems.find((item) => item.place?.address)?.place
    ?.address

  if (!address) return '위치 정보 없음'

  const parts = address.split(' ')
  return parts.slice(0, 2).join(' ')
}

export default function PlaceCard({
  trip,
  detailItems,
  reviewSummary,
  isHot = false,
}: PlaceCardProps) {
  const router = useRouter()

  const categoryLabel = inferMainCategory(detailItems)
  const tags = buildTags(detailItems)
  const featureBadges = buildFeatureBadges(detailItems)
  const locationLabel = getLocationLabel(detailItems)

  const ratingText =
    reviewSummary.reviewCount > 0 ? reviewSummary.averageRating.toFixed(1) : '-'

  const reviewCountText =
    reviewSummary.reviewCount > 0 ? `(${reviewSummary.reviewCount})` : '(0)'

  const handleMoveDetail = () => {
    router.push(`/search/${trip.id}`)
  }

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleMoveDetail()
    }
  }

  return (
    <article className="overflow-hidden rounded-[28px] border border-gray-200 bg-[#f6f6f8] shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div
        role="button"
        tabIndex={0}
        onClick={handleMoveDetail}
        onKeyDown={handleCardKeyDown}
        className="block w-full cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#6c3cff] focus:ring-offset-2"
      >
        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-t-[28px]">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-emerald-100 to-blue-200" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm">
              {categoryLabel}
            </span>

            {isHot && (
              <span className="inline-flex items-center rounded-full bg-orange-500 px-3 py-2 text-sm font-bold text-white shadow-sm">
                <Flame className="mr-1 h-4 w-4 fill-white text-white" />
                HOT 코스
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm"
          >
            <Bookmark className="h-6 w-6" />
          </button>

          {featureBadges.length > 0 && (
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {featureBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-md bg-black/65 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-[2px]"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 px-5 pb-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[18px] font-extrabold leading-snug text-[#1f2650]">
                {trip.title || '제목 없는 일정'}
              </h3>

              <p className="mt-1 text-sm font-medium text-gray-400">
                {locationLabel}
              </p>
            </div>

            <div className="shrink-0 pt-1 text-right">
              <div className="flex items-center gap-1 text-[#f4b400]">
                <span className="text-[22px] leading-none">★</span>
                <span className="text-[16px] font-extrabold text-[#1f2650]">
                  {ratingText}
                </span>
                <span className="text-sm font-medium text-gray-400">
                  {reviewCountText}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Route className="h-4 w-4" />
              {formatDistance(trip.total_distance)}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" />
              {formatTravelTime(trip.total_travel_time)}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {detailItems.length}곳
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              {formatCost(trip.total_cost)}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Bookmark className="h-4 w-4" />
              {trip.is_saved ? '저장됨' : '-'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-[#8b8fa3]">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span key={tag} className="font-medium">
                  #{tag}
                </span>
              ))
            ) : (
              <>
                <span className="font-medium">#추천여행</span>
                <span className="font-medium">#힐링</span>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <span className="text-[22px] font-extrabold text-[#6c3cff]">
              코스 상세보기 →
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
