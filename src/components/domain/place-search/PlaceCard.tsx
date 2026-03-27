'use client'

import { useState } from 'react'
import type { Trip, TripDetailItem } from './PlaceSearchSection'

<<<<<<< HEAD
<<<<<<< HEAD
interface PlaceCardProps {
<<<<<<< HEAD
=======
interface PlaceCardProps {
>>>>>>> 5d856d0 (Feat: 검색로직 추가)
  trip: Trip
  detailItems: TripDetailItem[]
}

export default function PlaceCard({ trip, detailItems }: PlaceCardProps) {
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

          <span className="text-xs text-gray-400">
            {isOpen ? '접기 ▲' : '상세보기 ▼'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
          <div className="rounded-lg bg-white p-3">
            <p className="text-xs font-medium text-gray-500">일정 제목</p>
            <p className="mt-1 text-sm text-gray-900">
              {trip.title || '제목 없음'}
            </p>
          </div>

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
  )
}
