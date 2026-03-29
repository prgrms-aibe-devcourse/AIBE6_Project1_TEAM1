'use client'

import GlobalHeader from '@/components/layout/GlobalHeader'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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

export default function ReviewViewPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [review, setReview] = useState<any>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([])
  const [images, setImages] = useState<{ file_url: string }[]>([])
  const [placeMap, setPlaceMap] = useState<Record<number, string>>({})
  const { openModal } = useModalStore()

  const reviewIdParam = searchParams.get('reviewId')
  const reviewId = reviewIdParam ? Number(reviewIdParam) : null
  if (!reviewId) {
    openModal({
      type: 'alert',
      variant: 'danger',
      title: '잘못된 접근',
      description: '리뷰 ID가 존재하지 않습니다.',
      onConfirm: () => router.push('/'),
    })
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!reviewId) return

      setLoading(true)

      // ✅ 1. 리뷰 가져오기
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (reviewError) {
        console.error(reviewError)
        openModal({
          type: 'alert',
          variant: 'danger',
          title: '리뷰 조회 실패',
          description: '리뷰 조회에 실패했습니다.',
          onConfirm: () => {
            router.push('/')
          },
        })
      }

      setReview(reviewData)

      // ✅ 2. routes 가져오기
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('review_id', reviewId)
        .order('order', { ascending: true })

      if (routeError || !routeData) {
        console.error(routeError)
        openModal({
          type: 'alert',
          variant: 'danger',
          title: '경로 조회 실패',
          description: '경로 조회에 실패했습니다.',
          onConfirm: () => {
            router.push('/')
          },
        })
        return
      }

      // 👉 routes / options 분리
      const routesParsed: Route[] = routeData.map((r: any) => ({
        from: r.start,
        to: r.end,
        transport: r.transport_type,
      }))

      const optionsParsed: RouteOption[] = routeData.map((r: any) => ({
        slope: r.slope,
        stairs: r.stairs,
        shade: r.shade,
      }))

      setRoutes(routesParsed)
      setRouteOptions(optionsParsed)

      // ✅ 3. 이미지 가져오기
      const { data: imageData, error: imageError } = await supabase
        .from('images')
        .select('*')
        .eq('review_id', reviewId)

      if (imageError) {
        console.error(imageError)
      }

      setImages(imageData || [])

      // ✅ 4. place 이름 매핑
      const ids = Array.from(
        new Set(
          routeData.flatMap((r: any) => [r.start, r.end].filter(Boolean)),
        ),
      )

      if (ids.length > 0) {
        const { data: places } = await supabase
          .from('places')
          .select('id, place_name')
          .in('id', ids)

        const map: Record<number, string> = {}
        places?.forEach((p: any) => {
          map[p.id] = p.place_name
        })

        setPlaceMap(map)
      }

      setLoading(false)
    }

    fetchData()
  }, [reviewId])

  const getTransportIcon = (transport: string) => {
    switch (transport) {
      case 'walk':
        return '👟'
      case 'bus':
        return '🚍'
      case 'subway':
        return '🚇'
      case 'taxi':
        return '🚖'
      case 'transit':
        return '🚌'
      default:
        return '❓'
    }
  }

  if (loading) return <div>로딩 중...</div>
  if (!review) return <div>데이터 없음</div>

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex-col w-auto self-center">
        <GlobalHeader />
        <div className="py-4">
          <button
            className="text-2xl p-2 cursor-pointer"
            onClick={() => router.back()}
          >
            ←
          </button>
          <h1 className="inline text-2xl p-4 font-bold">리뷰 내용</h1>
        </div>

        {/* ⭐ 평점 */}
        <div className="text-xl font-bold py-4">평점</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-2xl cursor-pointer ${
                star <= review.rating ? 'text-black' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* 🛣️ 경로 */}
        <div className="text-xl font-bold py-4">경로별 보행 환경</div>
        <div className="border rounded-xl p-4 mb-6">
          {routes.map((route, index) => {
            const opt = routeOptions[index]

            return (
              <div
                key={index}
                className="flex items-center justify-between border-b py-2 text-center"
              >
                <div className="flex flex-col items-center justify-center w-64 font-medium">
                  {placeMap[route.from] ?? route.from}
                  <br />
                  → <br />
                  {placeMap[route.to] ?? route.to}
                </div>
                <div className="flex flex-col items-center justify-center w-20 text-2xl">
                  {getTransportIcon(route.transport)}
                </div>

                <div className="text-sm text-gray-600">
                  경사도: {opt?.slope || '-'} / 계단: {opt?.stairs || '-'} /
                  그늘: {opt?.shade || '-'}
                </div>
              </div>
            )
          })}
        </div>

        {/* 📝 리뷰 내용 */}
        <div className="mb-6">
          <div className="font-bold mb-2">리뷰 내용</div>
          <div>{review.content}</div>
        </div>

        {/* 📷 이미지 */}
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img.file_url}
              alt="review image"
              width={200}
              height={200}
              className="rounded"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
