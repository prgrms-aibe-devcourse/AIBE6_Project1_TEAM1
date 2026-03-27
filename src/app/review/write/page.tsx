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
  const [options, setOptions] = useState({
    slope: '',
    stairs: '',
    shade: '',
  })

  const [userId, setUserId] = useState<string | null>(null)
  const [tripTitle, setTriptitle] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>()
  const [endDate, setEndDate] = useState<string | null>()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // url 형식 : /review/write?tripId="일정번호"
  const searchParams = useSearchParams()
  const tripId = Number(searchParams.get('tripId'))
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

    const getTripData = async () => {
      setLoading(true)
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (tripError) {
        setLoading(false)
        console.error(tripError)
        return alert('오류 발생')
      }

      setTriptitle(tripData.title)
      setStartDate(tripData.start_date)
      setEndDate(tripData.end_date)
      setLoading(false)
    }
    getTripData()
  }, [])

  const getRoutesFromTrip = async (
    supabase: any,
    tripId: number,
  ): Promise<Route[]> => {
    // 1️⃣ trips_item 가져오기
    const { data, error } = await supabase
      .from('trip_items')
      .select('place_id, visit_order, transport_type')
      .eq('trip_id', tripId)
      .order('visit_order', { ascending: true })

    if (error) {
      console.error('trips_items 조회 실패:', error)
      return []
    }

    if (!data || data.length < 2) return []

    // 2️⃣ routes 생성
    const routes: Route[] = []

    for (let i = 0; i < data.length - 1; i++) {
      const current = data[i]
      const next = data[i + 1]

      routes.push({
        from: current.place_id,
        to: next.place_id,
        transport: next.transport_type, // 🔥 다음 이동 기준
      })
    }

    return routes
  }
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!tripId) return

      const result = await getRoutesFromTrip(supabase, tripId)
      setRoutes(result)
    }

    fetchRoutes()
  }, [tripId])

  // 이미 리뷰가 작성되었는지 체크
  // useEffect(() => {
  //   const checkReview = async () => {
  //     setLoading(true)
  //     const { data: reviewData, error: reviewError } = await supabase
  //       .from('reviews')
  //       .select('*')
  //       .match({ user_id: userId, trip_id: tripId })
  //     if (reviewData && reviewData.length > 0) {
  //       alert('이미 리뷰가 있습니다')
  //       router.push('/')
  //     }
  //     setLoading(false)
  //   }
  //   checkReview()
  // }, [userId])

  // 리뷰 등록
  const handleSubmit = async () => {
    if (loading) return
    if (!rating) return alert('별점을 선택해주세요')
    // if (!options.slope || !options.width || !options.stairs)
    //   return alert('보행 환경을 선택해주세요')
    // if (!content) return alert('내용을 입력해주세요')

    setLoading(true)
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        user_id: userId,
        trip_id: tripId,
        rating,
        content,
        // slope: options.slope,
        // width: options.width,
        // stairs: options.stairs,
      })
      .select()
      .single()

    if (reviewError) {
      setLoading(false)
      console.error(reviewError)
      return alert('리뷰 저장 실패')
    }

    const reviewId = reviewData.id
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
        return alert('사진 저장 실패')
      }
    }

    setLoading(false)
    alert('등록 완료!')
    router.push(`/review/view?reviewId=${reviewId}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex-col w-1/3 self-center">
        <div className="py-4">
          <button
            className="text-2xl p-2 cursor-pointer"
            onClick={() => router.back()}
          >
            ←
          </button>
          <h1 className="inline text-2xl p-4 font-bold">리뷰작성</h1>
        </div>

        <div className="border rounded-xl mb-6 p-6 flex flex-row gap-4 text-gray-400">
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
          {loading ? '등록 중...' : '리뷰 등록'}
        </button>
      </div>
    </div>
  )
}
