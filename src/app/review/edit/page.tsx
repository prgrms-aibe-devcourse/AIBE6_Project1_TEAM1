'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'

import EditMediaUploader from '@/components/domain/review/EditMediaUploader'
import RatingSelector from '@/components/domain/review/RatingSelector'
import RouteOptionSelector from '@/components/domain/review/RouteOptionSelector'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'

type Route = { from: number; to: number; transport: string }
type RouteOption = { slope: string; stairs: string; shade: string }
type MediaItem = { id?: number; url: string; path: string; isNew?: boolean }

function ReviewEditContent() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const searchParams = useSearchParams()
  const reviewId = Number(searchParams.get('reviewId'))

  const { openModal } = useModalStore()

  // --- State ---
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<MediaItem[]>([])
  const [originalImages, setOriginalImages] = useState<MediaItem[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([])
  const [tripId, setTripId] = useState<number | null>(null)
  const [tripTitle, setTripTitle] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [placeMap, setPlaceMap] = useState<Record<number, string>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const mediaCleanupRef = useRef<(() => Promise<void>) | undefined>(undefined)

  // --- Get current user ---
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserId(data?.user?.id ?? null)
    }
    getUser()
  }, [supabase])

  // --- Fetch review ---
  useEffect(() => {
    if (!reviewId) return

    const fetchReview = async () => {
      setLoading(true)

      try {
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('*')
          .eq('id', reviewId)
          .single()

        if (reviewError || !reviewData) {
          console.error('리뷰 조회 실패:', reviewError)
          openModal({
            type: 'alert',
            variant: 'danger',
            title: '리뷰 조회 실패',
            description: '리뷰를 불러올 수 없습니다.',
            onConfirm: () => router.back(),
          })
          return
        }

        setTripId(reviewData.trip_id)
        setRating(reviewData.rating)
        setContent(reviewData.content)

        // --- Routes ---
        const { data: routeData, error: routeError } = await supabase
          .from('routes')
          .select('*')
          .eq('review_id', reviewId)
          .order('order', { ascending: true })

        if (routeError || !routeData) {
          console.error('경로 조회 실패:', routeError)
          openModal({
            type: 'alert',
            variant: 'danger',
            title: '경로 조회 실패',
            description: '경로 정보를 불러올 수 없습니다.',
            onConfirm: () => router.back(),
          })
          return
        }

        setRoutes(
          routeData.map((r: any) => ({
            from: r.start,
            to: r.end,
            transport: r.transport_type,
          })),
        )

        setRouteOptions(
          routeData.map((r: any) => ({
            slope: r.slope || '',
            stairs: r.stairs || '',
            shade: r.shade || '',
          })),
        )

        // --- Images ---
        const { data: imageData } = await supabase
          .from('images')
          .select('file_url, file_path')
          .eq('review_id', reviewId)

        const formattedImages = (imageData ?? []).map((img: any) => ({
          url: img.file_url,
          path: img.file_path,
          isNew: false,
        }))

        setImages(formattedImages)
        setOriginalImages(formattedImages)
      } finally {
        setLoading(false)
      }
    }

    fetchReview()
  }, [reviewId, supabase, openModal, router])

  // --- Fetch trip info ---
  useEffect(() => {
    if (!tripId) return

    const fetchTrip = async () => {
      const { data: tripData, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) {
        console.error('Trip 조회 실패:', error)
        return
      }

      setTripTitle(tripData.title)
      setStartDate(tripData.start_date)
      setEndDate(tripData.end_date)
    }

    fetchTrip()
  }, [tripId, supabase])

  // --- Fetch place map ---
  useEffect(() => {
    if (routes.length === 0) return

    const fetchPlaces = async () => {
      const ids = Array.from(new Set(routes.flatMap((r) => [r.from, r.to])))
      const { data, error } = await supabase
        .from('places')
        .select('id, place_name')
        .in('id', ids)

      if (error) {
        console.error('Places 조회 실패:', error)
        return
      }

      const map: Record<number, string> = {}
      data?.forEach((item) => (map[item.id] = item.place_name))
      setPlaceMap(map)
    }

    fetchPlaces()
  }, [routes, supabase])

  // --- Submit handler ---
  const handleSubmit = async () => {
    if (loading) return

    // Validation
    if (!rating)
      return openModal({
        type: 'alert',
        variant: 'danger',
        title: '별점 선택',
        description: '별점을 선택해주세요.',
      })
    if (!content)
      return openModal({
        type: 'alert',
        variant: 'danger',
        title: '내용 없음',
        description: '내용을 입력해주세요.',
      })
    if (routes.length !== routeOptions.length)
      return openModal({
        type: 'alert',
        variant: 'danger',
        title: '옵션 오류',
        description: '경로 옵션이 모두 선택되지 않았습니다.',
      })
    const hasEmptyWalk = routes.some(
      (r, idx) =>
        r.transport === 'walk' &&
        (!routeOptions[idx]?.slope ||
          !routeOptions[idx]?.stairs ||
          !routeOptions[idx]?.shade),
    )
    if (hasEmptyWalk)
      return openModal({
        type: 'alert',
        variant: 'danger',
        title: '보행 옵션 오류',
        description: '도보 경로의 보행 환경을 모두 선택해주세요.',
      })

    setLoading(true)

    try {
      // 1. 리뷰 업데이트
      const { error: reviewError } = await supabase
        .from('reviews')
        .update({ rating, content })
        .eq('id', reviewId)
      if (reviewError) throw reviewError

      // 2. routes 삭제 후 삽입
      await supabase.from('routes').delete().eq('review_id', reviewId)
      const routeRows = routes.map((r, idx) => ({
        user_id: userId,
        trip_id: tripId,
        review_id: reviewId,
        start: r.from,
        end: r.to,
        order: idx + 1,
        transport_type: r.transport,
        slope: r.transport === 'walk' ? routeOptions[idx]?.slope : null,
        stairs: r.transport === 'walk' ? routeOptions[idx]?.stairs : null,
        shade: r.transport === 'walk' ? routeOptions[idx]?.shade : null,
      }))
      const { error: routeError } = await supabase
        .from('routes')
        .insert(routeRows)
      if (routeError) throw routeError

      // 3. 이미지 삭제/업로드 처리 (DB 전체 교체)
      const deletedImages = originalImages.filter(
        (orig) => !images.find((img) => img.path === orig.path),
      )
      if (deletedImages.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('media-storage')
          .remove(deletedImages.map((img) => img.path))
        if (storageError) throw storageError
      }
      await supabase.from('images').delete().eq('review_id', reviewId)
      if (images.length > 0) {
        const { error: imageError } = await supabase.from('images').insert(
          images.map((img) => ({
            review_id: reviewId,
            file_url: img.url,
            file_path: img.path,
          })),
        )
        if (imageError) throw imageError
      }

      router.back()
    } catch (err) {
      console.error('리뷰 수정 실패:', err)
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '수정 실패',
        description: '리뷰 수정에 실패했습니다.',
        onConfirm: () => router.back(),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex-col w-auto self-center">
        <div className="py-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <button
            className="text-2xl p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            onClick={async () => {
              if (mediaCleanupRef.current) await mediaCleanupRef.current()
              router.back()
            }}
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">리뷰 수정</h1>
        </div>

        {/* Trip info */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl mb-6 p-6 flex flex-row gap-4 text-gray-700 dark:text-gray-300">
          <div className="flex flex-col">
            <div>{tripTitle}</div>
            <div>
              {startDate} ~ {endDate}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="text-xl font-bold dark:text-gray-100">전체 평점</div>
        <div className="p-4">
          <RatingSelector rating={rating} setRating={setRating} />
        </div>

        {/* Route options */}
        <div className="text-xl font-bold py-4 dark:text-gray-100">경로별 보행 환경</div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl mb-6 p-6 flex flex-col text-gray-700 dark:text-gray-300">
          <RouteOptionSelector
            routes={routes}
            placeMap={placeMap}
            options={routeOptions}
            onChange={setRouteOptions}
          />
        </div>

        {/* Content */}
        <div className="text-xl font-bold py-4 dark:text-gray-100">리뷰 내용</div>
        <textarea
          name="content"
          rows={4}
          className="resize-none w-full py-4 px-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-transparent dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="뚜벅이 여행자에게 도움이 될 보행환경, 접근성, 추천 팁 등을 작성해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Media uploader */}
        <div className="text-xl font-bold py-4 dark:text-gray-100">사진 첨부</div>
        <EditMediaUploader
          supabase={supabase}
          images={images}
          onUpload={(uploaded) =>
            setImages((prev) => [
              ...prev,
              ...uploaded.map((f) => ({ ...f, isNew: true })),
            ])
          }
          onRemove={setImages}
          onCleanup={mediaCleanupRef}
        />

        {/* Buttons */}
        <div className="flex gap-2 my-6">
          <button
            className="w-1/2 bg-black dark:bg-purple-600 text-white py-3 rounded-lg cursor-pointer hover:bg-gray-900 dark:hover:bg-purple-700 transition-colors"
            onClick={() =>
              openModal({
                type: 'confirm',
                variant: 'primary',
                title: '리뷰를 수정하시겠습니까?',
                confirmText: '수정',
                cancelText: '취소',
                onConfirm: handleSubmit,
              })
            }
          >
            {loading ? '수정 중...' : '리뷰 수정'}
          </button>
          <button
            className="w-1/2 bg-white dark:bg-gray-800 text-black dark:text-white py-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={async () => {
              if (mediaCleanupRef.current) await mediaCleanupRef.current()
              router.back()
            }}
          >
            수정 취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReviewEditPage() {
  return (
    <Suspense fallback={null}>
      <ReviewEditContent />
    </Suspense>
  )
}
