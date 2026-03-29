'use client'

import { useEffect, useMemo, useState } from 'react'
import PlaceCard from './PlaceCard'
import type {
  Trip,
  TripDetailItem,
  TripReviewSummary,
} from './PlaceSearchSection'

interface PlaceListProps {
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
  tripReviewSummaryMap: Record<number, TripReviewSummary>
}

const ITEMS_PER_PAGE = 6

export default function PlaceList({
  trips,
  tripDetailsMap,
  tripReviewSummaryMap,
}: PlaceListProps) {
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [trips])

  const totalPages = Math.max(1, Math.ceil(trips.length / ITEMS_PER_PAGE))

  const currentTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return trips.slice(startIndex, endIndex)
  }, [currentPage, trips])

  const hotTripIds = useMemo(() => {
    const rankedTrips = trips
      .map((trip) => ({
        id: trip.id,
        reviewCount: tripReviewSummaryMap[trip.id]?.reviewCount ?? 0,
      }))
      .filter((trip) => trip.reviewCount > 0)
      .sort((a, b) => b.reviewCount - a.reviewCount)

    if (rankedTrips.length === 0) {
      return new Set<number>()
    }

    const hotCount = Math.max(1, Math.ceil(rankedTrips.length * 0.1))

    return new Set(rankedTrips.slice(0, hotCount).map((trip) => trip.id))
  }, [trips, tripReviewSummaryMap])

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  if (trips.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        검색 결과가 없습니다.
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {currentTrips.map((trip) => (
          <PlaceCard
            key={trip.id}
            trip={trip}
            detailItems={tripDetailsMap[trip.id] ?? []}
            reviewSummary={
              tripReviewSummaryMap[trip.id] ?? {
                averageRating: 0,
                reviewCount: 0,
              }
            }
            isHot={hotTripIds.has(trip.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          이전
        </button>

        <span className="text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </section>
  )
}
