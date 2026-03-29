'use client'

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

type MediaItem = {
  id?: number
  url: string
  path: string
  isNew?: boolean
}

import EditMediaUploader from '@/components/domain/review/EditMediaUploader'
import RatingSelector from '@/components/domain/review/RatingSelector'
import RouteOptionSelector from '@/components/domain/review/RouteOptionSelector'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function ReviewWritePage() {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<MediaItem[]>([])
  const [originalImages, setOriginalImages] = useState<
    { url: string; path: string }[]
  >([])
  const mediaCleanupRef = useRef<(() => Promise<void>) | undefined>(undefined)

  const [userId, setUserId] = useState<string | null>(null)
  const [tripTitle, setTriptitle] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>()
  const [endDate, setEndDate] = useState<string | null>()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { openModal } = useModalStore()

  // url 형식 : /review/edit?reviewId="리뷰번호"
  const searchParams = useSearchParams()
  const reviewId = Number(searchParams.get('reviewId'))
  const [tripId, setTripId] = useState<number | null>(null)
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [placeMap, setPlaceMap] = useState<Record<number, string>>({})

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserId(user?.id ?? null)
      console.log(userId)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!reviewId) return

    const fetchReview = async () => {
      setLoading(true)

      // 1. 리뷰
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (reviewError) {
        console.error(reviewError)
        return alert('리뷰 불러오기 실패')
      }

      setTripId(reviewData.trip_id)
      setRating(reviewData.rating)
      setContent(reviewData.content)

      // 2. routes
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('review_id', reviewId)
        .order('order', { ascending: true })

      if (routeError) {
        console.error(routeError)
        return alert('경로 불러오기 실패')
      }

      // 3. routes 세팅
      const formattedRoutes = routeData.map((r: any) => ({
        from: r.start,
        to: r.end,
        transport: r.transport_type,
      }))
      setRoutes(formattedRoutes)

      // 4. options 세팅
      const formattedOptions = routeData.map((r: any) => ({
        slope: r.slope || '',
        stairs: r.stairs || '',
        shade: r.shade || '',
      }))
      setRouteOptions(formattedOptions)

      // 5. images 세팅
      const { data: imageData } = await supabase
        .from('images')
        .select('file_url, file_path')
        .eq('review_id', reviewId)

      const formattedImages =
        imageData?.map((img: any) => ({
          url: img.file_url,
          path: img.file_path,
          isNew: false,
        })) ?? []

      setImages(formattedImages)
      setOriginalImages(formattedImages)

      setLoading(false)
    }

    fetchReview()
  }, [reviewId])

  useEffect(() => {
    if (!tripId) return

    const getTripData = async () => {
      const { data: tripData, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setTriptitle(tripData.title)
      setStartDate(tripData.start_date)
      setEndDate(tripData.end_date)
    }

    getTripData()
  }, [tripId])

  useEffect(() => {
    const fetchPlaces = async () => {
      const ids = Array.from(new Set(routes.flatMap((r) => [r.from, r.to])))
      const { data, error } = await supabase
        .from('places')
        .select('id, place_name')
        .in('id', ids)

      if (error) {
        console.error(error)
        return
      }

      const map: Record<number, string> = {}
      data?.forEach((item) => {
        map[item.id] = item.place_name
      })
      setPlaceMap(map)
    }

    if (routes.length > 0) fetchPlaces()
  }, [routes])

  // 리뷰 수정 등록
  const handleSubmit = async () => {
    if (loading) return
    if (!rating) return alert('별점을 선택해주세요')

    if (routes.length !== routeOptions.length) {
      return alert('경로 옵션이 모두 선택되지 않았습니다')
    }

    const hasEmpty = routes.some((route, index) => {
      if (route.transport !== 'walk') return false
      const opt = routeOptions[index]
      return !opt?.slope || !opt?.stairs || !opt?.shade
    })

    if (hasEmpty) {
      return alert('도보 경로의 보행 환경을 모두 선택해주세요')
    }

    if (!content) return alert('내용을 입력해주세요')

    setLoading(true)

    // reviews 업데이트
    const { error: reviewError } = await supabase
      .from('reviews')
      .update({
        rating,
        content,
      })
      .eq('id', reviewId)

    if (reviewError) {
      console.error(reviewError)
      setLoading(false)
      return alert('리뷰 수정 실패')
    }

    // 기존 routes 삭제 후 재삽입
    await supabase.from('routes').delete().eq('review_id', reviewId)

    const routeRows = routes.map((route, index) => {
      const isWalk = route.transport === 'walk'
      const option = routeOptions[index]

      return {
        user_id: userId,
        trip_id: tripId,
        review_id: reviewId,
        start: route.from,
        end: route.to,
        order: index + 1,
        transport_type: route.transport,
        slope: isWalk ? option?.slope : null,
        stairs: isWalk ? option?.stairs : null,
        shade: isWalk ? option?.shade : null,
      }
    })

    const { error: routeError } = await supabase
      .from('routes')
      .insert(routeRows)

    if (routeError) {
      console.error(routeError)
      setLoading(false)
      return alert('경로 수정 실패')
    }

    // images 삭제 후 재삽입
    // 🔥 1. 삭제된 이미지 찾기
    const deletedImages = originalImages.filter(
      (orig) => !images.find((img) => img.path === orig.path),
    )

    // 🔥 2. storage에서 실제 삭제
    if (deletedImages.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('media-storage')
        .remove(deletedImages.map((img) => img.path))

      if (storageError) {
        console.error(storageError)
        setLoading(false)
        return alert('이미지 삭제 실패')
      }
    }

    // 🔥 3. DB는 기존처럼 전체 교체 (간단하고 안전)
    await supabase.from('images').delete().eq('review_id', reviewId)

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
        console.error(imageError)
        setLoading(false)
        return alert('사진 수정 실패')
      }
    }

    setLoading(false)
    router.push(`/review/view?reviewId=${reviewId}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex-col w-auto self-center">
        <div className="py-4">
          <button
            className="text-2xl p-2 cursor-pointer"
            onClick={async () => {
              if (mediaCleanupRef.current) await mediaCleanupRef.current()
              router.back()
            }}
          >
            ←
          </button>
          <h1 className="inline text-2xl p-4 font-bold">리뷰 수정</h1>
        </div>

        <div className="border rounded-xl mb-6 p-6 flex flex-row gap-4 text-gray-700">
          <div>
            <Image src="/icon.svg" width={50} height={50} alt="card image" />
          </div>
          <div className="flex-col">
            <div>{tripTitle}</div>
            <div>
              {startDate} ~ {endDate}
            </div>
          </div>
        </div>

        <div className="text-xl font-bold">전체 평점</div>
        <div className="p-4">
          <RatingSelector rating={rating} setRating={setRating} />
        </div>

        <div className="text-xl font-bold py-4">경로별 보행 환경</div>
        <div className="border rounded-xl mb-6 p-6 flex flex-col text-gray-700">
          <RouteOptionSelector
            routes={routes}
            placeMap={placeMap}
            options={routeOptions}
            onChange={setRouteOptions}
          />
        </div>

        <div className="text-xl font-bold py-4">리뷰 내용</div>
        <div>
          <textarea
            name="content"
            rows={4}
            className="resize-none w-full py-4"
            placeholder=" 뚜벅이 여행자에게 도움이 될 보행환경, 접근성, 추천 팁 등을 자유롭게 작성해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="text-xl font-bold py-4">사진 첨부</div>
        <div className="mb-6">
          <EditMediaUploader
            supabase={supabase}
            images={images}
            onUpload={(uploaded: { url: string; path: string }[]) =>
              setImages((prev) => [
                ...prev,
                ...uploaded.map((f) => ({ ...f, isNew: true })),
              ])
            }
            onRemove={(updated: { url: string; path: string }[]) =>
              setImages(updated)
            }
            onCleanup={mediaCleanupRef}
          />
        </div>

        <button
          className="w-1/2 bg-black text-white py-3 rounded-lg mb-6 cursor-pointer"
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
          className="w-1/2 bg-white text-black py-3 rounded-lg mb-6 cursor-pointer border"
          onClick={async () => {
            if (mediaCleanupRef.current) await mediaCleanupRef.current()
            router.back()
          }}
        >
          수정 취소
        </button>
      </div>
    </div>
  )
}
