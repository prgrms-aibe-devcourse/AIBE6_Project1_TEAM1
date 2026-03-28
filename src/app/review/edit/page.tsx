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

import MediaUploader from '@/components/domain/review/MediaUploader'
import RatingSelector from '@/components/domain/review/RatingSelector'
import RouteOptionSelector from '@/components/domain/review/RouteOptionSelector'
import { createClient } from '@/utils/supabase/client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReviewWritePage() {
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<{ url: string; path: string }[]>([])

  const [userId, setUserId] = useState<string | null>(null)
  const [tripId, setTripId] = useState(0)
  const [tripTitle, setTriptitle] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>()
  const [endDate, setEndDate] = useState<string | null>()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // url 형식 : /review/edit?reviewId="리뷰번호"
  const searchParams = useSearchParams()
  const reviewId = Number(searchParams.get('reviewId'))
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([])
  const [routes, setRoutes] = useState<Route[]>([])

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

      // 1️⃣ 리뷰
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (reviewError) {
        console.error(reviewError)
        return alert('리뷰 불러오기 실패')
      }

      setRating(reviewData.rating)
      setContent(reviewData.content)
      setTripId(reviewData.trip_id)

      // 2️⃣ routes
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('trip_id', tripId)

      if (routeError) {
        console.error(routeError)
        return alert('경로 불러오기 실패')
      }

      // routes 세팅
      const formattedRoutes = routeData.map((r: any) => ({
        from: r.start,
        to: r.end,
        transport: r.transport_type,
      }))
      setRoutes(formattedRoutes)

      // options 세팅
      const formattedOptions = routeData.map((r: any) => ({
        slope: r.slope || '',
        stairs: r.stairs || '',
        shade: r.shade || '',
      }))
      setRouteOptions(formattedOptions)

      // 3️⃣ images
      const { data: imageData } = await supabase
        .from('images')
        .select('*')
        .eq('review_id', reviewId)

      if (imageData) {
        setImages(
          imageData.map((img: any) => ({
            url: img.file_url,
            path: img.file_path,
          })),
        )
      }

      setLoading(false)
    }

    fetchReview()
  }, [reviewId])

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

    // ✅ 1️⃣ reviews 업데이트
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

    // ✅ 2️⃣ 기존 routes 삭제 후 재삽입 (간단하고 안전)
    await supabase.from('routes').delete().eq('trip_id', tripId)

    const routeRows = routes.map((route, index) => {
      const isWalk = route.transport === 'walk'
      const option = routeOptions[index]

      return {
        user_id: userId,
        trip_id: tripId,
        // review_id: reviewId, // ⭐ 중요
        start: route.from,
        end: route.to,
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

    // ✅ 3️⃣ images (같은 방식)
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
    alert('수정 완료!')
    router.push(`/review/view?reviewId=${reviewId}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex-col w-auto self-center">
        <div className="py-4">
          <button
            className="text-2xl p-2 cursor-pointer"
            onClick={() => router.back()}
          >
            ←
          </button>
          <h1 className="inline text-2xl p-4 font-bold">리뷰작성</h1>
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
            supabase={supabase}
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
          <MediaUploader
            supabase={supabase}
            onUpload={(urls: { url: string; path: string }[]) =>
              setImages((prev) => [...prev, ...urls])
            }
            onRemove={(urls: { url: string; path: string }[]) =>
              setImages(urls)
            }
          />
        </div>

        <button
          className="w-full bg-black text-white py-3 rounded-lg mb-6 cursor-pointer"
          onClick={handleSubmit}
        >
          {loading ? '수정 중...' : '리뷰 수정'}
        </button>
      </div>
    </div>
  )
}
