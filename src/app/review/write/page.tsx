'use client'

import MediaUploader from '@/components/domain/review/MediaUploader'
import RatingSelector from '@/components/domain/review/RatingSelector'
import RouteOptionSelector from '@/components/domain/review/RouteOptionSelector'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

type Route = {
  from: number
  to: number
  transport: string
}

type RouteOption = {
  slope: string
  stairs: string
  shade: string
}

function ReviewWriteContent() {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<{ url: string; path: string }[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [tripTitle, setTriptitle] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>()
  const [endDate, setEndDate] = useState<string | null>()
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([])
  const [placeMap, setPlaceMap] = useState<Record<number, string>>({})

  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { openModal } = useModalStore()
  const searchParams = useSearchParams()
  const tripId = Number(searchParams.get('tripId'))

  /** 사용자 정보 가져오기 */
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    getUser()
  }, [supabase])

  /** 여행 정보 가져오기 */
  useEffect(() => {
    const getTripData = async () => {
      setLoading(true)
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (tripError || !tripData) {
        setLoading(false)
        console.error(tripError)
        openModal({
          type: 'alert',
          variant: 'danger',
          title: '여행 일정 조회 오류',
          description: '여행 일정 조회에 오류가 발생했습니다.',
          onConfirm: () => router.push('/'),
        })
        return
      }

      setTriptitle(tripData.title)
      setStartDate(tripData.start_date)
      setEndDate(tripData.end_date)
      setLoading(false)
    }
    if (tripId) getTripData()
  }, [tripId, supabase, openModal, router])

  /** 경로 가져오기 */
  const getRoutesFromTrip = async (tripId: number): Promise<Route[]> => {
    const { data, error } = await supabase
      .from('trip_items')
      .select('place_id, visit_order, transport_type')
      .eq('trip_id', tripId)
      .order('visit_order', { ascending: true })

    if (error || !data || data.length < 2) return []

    const routes: Route[] = []
    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i]
      const next = data[i + 1]
      routes.push({
        from: current.place_id,
        to: next.place_id,
        transport: next.transport_type,
      })
    }
    return routes
  }

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!tripId) return
      const result = await getRoutesFromTrip(tripId)
      setRoutes(result)
    }
    fetchRoutes()
  }, [tripId])

  /** 장소 이름 매핑 */
  useEffect(() => {
    const fetchPlaces = async () => {
      const ids = Array.from(new Set(routes.flatMap((r) => [r.from, r.to])))
      const { data, error } = await supabase
        .from('places')
        .select('id, place_name')
        .in('id', ids)

      if (!data || error) return

      const map: Record<number, string> = {}
      data.forEach((item) => (map[item.id] = item.place_name))
      setPlaceMap(map)
    }
    if (routes.length > 0) fetchPlaces()
  }, [routes, supabase])

  /** 리뷰 등록 함수 */
  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)

    // 1️⃣ 리뷰 생성
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        trip_id: tripId,
        rating,
        content,
      })
      .select()
      .single()

    if (reviewError || !reviewData) {
      setLoading(false)
      console.error(reviewError)
      return openModal({
        type: 'alert',
        variant: 'danger',
        title: '리뷰 저장 오류',
        description: '리뷰 저장에 실패했습니다.',
      })
    }

    const reviewId = reviewData.id

    // 2️⃣ 경로 저장
    const routeRows = routes.map((route, index) => {
      const isWalk = route.transport === 'walk'
      const opt = routeOptions[index]

      return {
        user_id: userId,
        trip_id: tripId,
        review_id: reviewId,
        start: route.from,
        end: route.to,
        order: index + 1,
        transport_type: route.transport,
        slope: isWalk ? opt?.slope : null,
        stairs: isWalk ? opt?.stairs : null,
        shade: isWalk ? opt?.shade : null,
      }
    })

    const { error: routeError } = await supabase
      .from('routes')
      .insert(routeRows)
    if (routeError) {
      setLoading(false)
      console.error(routeError)
      return openModal({
        type: 'alert',
        variant: 'danger',
        title: '경로 저장 실패',
        description: '경로 저장에 실패했습니다.',
      })
    }

    // 3️⃣ 이미지 저장
    if (images.length > 0) {
      const imageRows = images.map((image) => ({
        review_id: reviewId,
        file_url: image.url,
        file_path: image.path,
      }))

      const { error: imageError } = await supabase
        .from('images')
        .insert(imageRows)
      if (imageError) {
        setLoading(false)
        console.error(imageError)
        return openModal({
          type: 'alert',
          variant: 'danger',
          title: '사진 저장 실패',
          description: '사진 저장에 실패했습니다.',
        })
      }
    }

    setLoading(false)
    router.push(`/mypage/reviews`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex-col w-auto self-center">
        <div className="py-4 text-gray-900 dark:text-gray-100">
          <button
            className="text-2xl p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            onClick={() => router.back()}
          >
            ←
          </button>
          <h1 className="inline text-2xl p-4 font-bold">리뷰 작성</h1>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-xl mb-6 p-6 flex flex-row gap-4 text-gray-700 dark:text-gray-300">
          <div className="flex-col">
            <div>{tripTitle}</div>
            <div>
              {startDate} ~ {endDate}
            </div>
          </div>
        </div>

        <div className="text-xl font-bold dark:text-gray-100">전체 평점</div>
        <div className="p-4">
          <RatingSelector rating={rating} setRating={setRating} />
        </div>

        <div className="text-xl font-bold py-4 dark:text-gray-100">경로별 보행 환경</div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl mb-6 p-6 flex flex-col text-gray-700 dark:text-gray-300">
          <RouteOptionSelector
            routes={routes}
            placeMap={placeMap}
            options={routeOptions}
            onChange={setRouteOptions}
          />
        </div>

        <div className="text-xl font-bold py-4 dark:text-gray-100">리뷰 내용</div>
        <textarea
          name="content"
          rows={4}
          className="resize-none w-full py-4 px-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-transparent dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-500 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="뚜벅이 여행자에게 도움이 될 보행환경, 접근성, 추천 팁 등을 자유롭게 작성해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="text-xl font-bold py-4 dark:text-gray-100">사진 첨부</div>
        <MediaUploader
          supabase={supabase}
          onUpload={(urls: { url: string; path: string }[]) =>
            setImages((prev) => [...prev, ...urls])
          }
          onRemove={(urls: { url: string; path: string }[]) => setImages(urls)}
        />

        {/* 등록 버튼 */}
        <button
          className="w-full bg-black dark:bg-purple-600 text-white py-3 rounded-lg my-6 cursor-pointer hover:bg-gray-900 dark:hover:bg-purple-700 transition-colors"
          onClick={() => {
            // ✅ 유효성 검사
            if (!rating) {
              return openModal({
                type: 'alert',
                variant: 'danger',
                title: '별점 선택 오류',
                description: '별점을 선택해주세요.',
              })
            }

            // 1️⃣ walk 경로만 필수 옵션 체크
            const walkRoutes = routes
              .map((route, index) => ({ route, index }))
              .filter(({ route }) => route.transport === 'walk')

            const hasEmpty = walkRoutes.some(({ index }) => {
              const opt = routeOptions[index]
              return !opt || !opt.slope || !opt.stairs || !opt.shade
            })

            if (hasEmpty) {
              openModal({
                type: 'alert',
                variant: 'danger',
                title: '보행 환경 선택 오류',
                description: '도보 경로의 보행 환경을 모두 선택해주세요',
              })
              return
            }

            // 2️⃣ routeOptions.length 체크 제거
            // 이제 walk가 아닌 경로 때문에 모달이 뜨지 않음

            if (!content) {
              return openModal({
                type: 'alert',
                variant: 'danger',
                title: '내용 오류',
                description: '내용을 입력해주세요.',
              })
            }

            // ✅ 모든 체크 통과 시 confirm 모달
            openModal({
              type: 'confirm',
              variant: 'primary',
              title: '리뷰를 등록하시겠습니까?',
              confirmText: '등록',
              cancelText: '취소',
              onConfirm: handleSubmit,
            })
          }}
        >
          {loading ? '등록 중...' : '리뷰 등록'}
        </button>
      </div>
    </div>
  )
}

export default function ReviewWritePage() {
  return (
    <Suspense fallback={null}>
      <ReviewWriteContent />
    </Suspense>
  )
}
