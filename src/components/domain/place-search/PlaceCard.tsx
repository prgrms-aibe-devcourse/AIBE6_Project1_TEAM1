'use client'

import { useState } from 'react'
import type { Trip, TripDetailItem } from './PlaceSearchSection'

interface PlaceCardProps {
<<<<<<< HEAD
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
}

export default function PlaceCard({
  place,
  isSelected = false,
  onClick,
}: PlaceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all ${
        isSelected
          ? 'border-black ring-1 ring-black'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={place.imageUrl}
          alt={place.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
          {place.name}
        </h3>

        {isSelected && (
          <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-700">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">주소:</span> {place.address}
              </p>

              <p>
                <span className="font-semibold">카테고리:</span>{' '}
                {place.category}
              </p>

              {place.categoryGroupName && (
                <p>
                  <span className="font-semibold">분류:</span>{' '}
                  {place.categoryGroupName}
                </p>
              )}

              {place.phone && (
                <p>
                  <span className="font-semibold">전화번호:</span> {place.phone}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </button>
>>>>>>> 64d8b82 (Feat: 검색결과 정렬)
  )
}
