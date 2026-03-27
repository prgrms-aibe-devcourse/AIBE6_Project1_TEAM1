'use client'

import { useEffect, useMemo, useState } from 'react'
import PlaceCard from './PlaceCard'
<<<<<<< HEAD
<<<<<<< HEAD
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
=======

interface Place {
  id: string
  name: string
  address: string
  category: string
  categoryGroupName?: string
  phone?: string
  imageUrl?: string
}
=======
import type { Trip, TripDetailItem } from './PlaceSearchSection'
>>>>>>> b807596 (Feat: 검색로직 전면 수정)

interface PlaceListProps {
  trips: Trip[]
  tripDetailsMap: Record<number, TripDetailItem[]>
}

<<<<<<< HEAD
export default function PlaceList({
  places,
  selectedPlaceId,
  onSelectPlace,
}: PlaceListProps) {
  if (places.length === 0) {
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
=======
export default function PlaceList({ trips, tripDetailsMap }: PlaceListProps) {
  if (trips.length === 0) {
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        검색 결과가 없습니다.
      </div>
    )
  }

  return (
<<<<<<< HEAD
<<<<<<< HEAD
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
=======
=======
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
<<<<<<< HEAD
    <div className="space-y-3">
      {trips.map((trip) => (
        <PlaceCard
          key={trip.id}
          trip={trip}
          detailItems={tripDetailsMap[trip.id] ?? []}
=======
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          isSelected={selectedPlaceId === place.id}
          onClick={() => onSelectPlace?.(place)}
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
=======
    <div className="space-y-3">
      {trips.map((trip) => (
        <PlaceCard
          key={trip.id}
          trip={trip}
          detailItems={tripDetailsMap[trip.id] ?? []}
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
        />
      ))}
    </div>
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
  )
}
