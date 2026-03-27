'use client'

import { useEffect, useMemo, useState } from 'react'
import PlaceCard from './PlaceCard'
import type { Trip, TripDetailItem } from './PlaceSearchSection'

interface PlaceListProps {
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
}

const ITEMS_PER_PAGE = 6

export default function PlaceList({ trips, tripDetailsMap }: PlaceListProps) {
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
=======
    <section className="space-y-6">
<<<<<<< HEAD
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
>>>>>>> 2e4a410 (Refactor: UI변경)
=======
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
>>>>>>> cc29114 (Refactor: UI변경)
        {currentTrips.map((trip) => (
          <PlaceCard
            key={trip.id}
            trip={trip}
            detailItems={tripDetailsMap[trip.id] ?? []}
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
<<<<<<< HEAD
=======
=======
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
<<<<<<< HEAD
=======
>>>>>>> 4948500 (Fix: 충돌수정)
    <div className="space-y-3">
      {trips.map((trip) => (
        <PlaceCard
          key={trip.id}
          trip={trip}
          detailItems={tripDetailsMap[trip.id] ?? []}
        />
      ))}
    </div>
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
=======
>>>>>>> 2e4a410 (Refactor: UI변경)
  )
}
