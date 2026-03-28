'use client'

import { useRouter } from 'next/navigation'
import type { Trip, TripDetailItem } from './PlaceSearchSection'

interface PlaceCardProps {
  trip: Trip
  detailItems: TripDetailItem[]
}

function getTripDurationDays(
  startDate?: string | null,
  endDate?: string | null,
) {
  if (!startDate || !endDate) return null

  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null
  }

  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1

  return diffDays > 0 ? diffDays : null
}

function getTripDurationLabel(
  startDate?: string | null,
  endDate?: string | null,
) {
  const days = getTripDurationDays(startDate, endDate)

  if (!days) return '-'
  if (days === 1) return '당일치기'

  return `${days} Days`
}

export default function PlaceCard({ trip, detailItems }: PlaceCardProps) {
  const router = useRouter()
  const durationLabel = getTripDurationLabel(trip.start_date, trip.end_date)

  const handleMoveDetail = () => {
    router.push(`/search/${trip.id}`)
  }

  return (
    <button
      type="button"
      onClick={handleMoveDetail}
      className="group relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-white opacity-80" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            일정
          </span>

          <span className="text-sm font-medium text-gray-400 transition group-hover:text-gray-600">
            상세보기 →
          </span>
        </div>

        <div className="mt-6 flex-1">
          <h3 className="line-clamp-2 text-2xl font-bold leading-snug text-gray-900">
            {trip.title || '제목 없는 일정'}
          </h3>
        </div>

        <div className="relative z-10 mt-4 flex justify-end">
          <div className="flex w-fit flex-col items-end">
            <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              {durationLabel}
            </span>

            <span className="mt-2 text-s font-semibold text-gray-500">
              {detailItems.length}개의 코스
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
