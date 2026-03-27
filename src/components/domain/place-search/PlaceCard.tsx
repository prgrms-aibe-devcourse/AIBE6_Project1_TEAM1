'use client'

import { useEffect, useState } from 'react'
import type { Trip, TripDetailItem } from './PlaceSearchSection'

<<<<<<< HEAD
interface PlaceCardProps {
<<<<<<< HEAD
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
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const durationLabel = getTripDurationLabel(trip.start_date, trip.end_date)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
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

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
              <div>
                <p className="text-sm font-medium text-purple-600">일정 상세</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                  {trip.title || '제목 없는 일정'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                닫기
              </button>
            </div>

            <div className="max-h-[calc(90vh-96px)] overflow-y-auto px-6 py-6">
              <div className="rounded-2xl bg-gray-50 p-5">
                <h4 className="text-base font-semibold text-gray-900">
                  일정 장소 목록
                </h4>

                {detailItems.length === 0 && (
                  <p className="mt-3 text-sm text-gray-500">
                    등록된 장소가 없습니다.
                  </p>
                )}

                {detailItems.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {detailItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              Day {item.visit_day ?? '-'} ·{' '}
                              {item.visit_order ?? '-'}번째 장소
                            </p>

                            <p className="mt-2 text-lg font-semibold text-gray-900">
                              {item.place?.place_name || '장소 이름 없음'}
                            </p>

                            <p className="mt-2 inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                              {item.place?.displayCategory ||
                                item.place?.category ||
                                '카테고리 없음'}
                            </p>

                            <p className="mt-3 text-sm text-gray-500">
                              {item.place?.address || '주소 정보 없음'}
                            </p>
                          </div>

                          <div className="shrink-0 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            <div>
                              <p className="text-xs font-medium text-gray-400">
                                이동수단
                              </p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {item.transport_type || '-'}
                              </p>
                            </div>

                            <div className="mt-4">
                              <p className="text-xs font-medium text-gray-400">
                                이동시간
                              </p>
                              <p className="mt-1 font-semibold text-gray-900">
                                {item.travel_time != null
                                  ? `${item.travel_time}분`
                                  : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
<<<<<<< HEAD
    </>
=======
    </div>
=======
  place: {
    id: string
    name: string
    address: string
    category: string
    categoryGroupName?: string
    phone?: string
    imageUrl?: string
  }
  isSelected?: boolean
  onClick?: () => void
=======
interface TripCardProps {
  trip: Trip
  detailItems: TripDetailItem[]
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
}

export default function PlaceCard({ trip, detailItems }: TripCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 text-left transition hover:bg-gray-50"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {trip.title || '제목 없는 일정'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {trip.start_date || '-'} ~ {trip.end_date || '-'}
            </p>
          </div>
<<<<<<< HEAD
        )}
      </div>
    </button>
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
<<<<<<< HEAD
>>>>>>> 908f1f0 (Feat: 검색결과 정렬)
=======
=======

          <span className="text-xs text-gray-400">
            {isOpen ? '접기 ▲' : '상세보기 ▼'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
          <div className="mt-4 rounded-xl bg-white p-4">
            <h4 className="text-sm font-semibold text-gray-900">
              일정 장소 목록
            </h4>

            {detailItems.length === 0 && (
              <p className="mt-3 text-sm text-gray-500">
                등록된 장소가 없습니다.
              </p>
            )}

            {detailItems.length > 0 && (
              <div className="mt-3 space-y-3">
                {detailItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Day {item.visit_day ?? '-'} ·{' '}
                          {item.visit_order ?? '-'}번째 장소
                        </p>
                        <p className="mt-1 text-sm text-gray-800">
                          {item.place?.place_name || '장소 이름 없음'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.place?.displayCategory ||
                            item.place?.category ||
                            '카테고리 없음'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.place?.address || '주소 정보 없음'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">이동수단</p>
                        <p className="text-sm text-gray-900">
                          {item.transport_type || '-'}
                        </p>

                        <p className="mt-2 text-xs text-gray-500">이동시간</p>
                        <p className="text-sm text-gray-900">
                          {item.travel_time != null
                            ? `${item.travel_time}분`
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
>>>>>>> b807596 (Feat: 검색로직 전면 수정)
>>>>>>> d603736 (Feat: 검색로직 전면 수정)
  )
}
