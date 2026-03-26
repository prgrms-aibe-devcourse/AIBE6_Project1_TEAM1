'use client'

import MediaUploader from '@/components/domain/review/MediaUploader'
import OptionSelector from '@/components/domain/review/OptionSelector'
import RatingSelector from '@/components/domain/review/RatingSelector'
import { createClient } from '@/utils/supabase/client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReviewEditPage() {
  const [placeId, setPlaceId] = useState(0)
  const [rating, setRating] = useState(3)
  const [content, setContent] = useState('불러오기테스트')
  const [media, setMedia] = useState<{ url: string; path: string }[]>([])
  const [options, setOptions] = useState({
    slope: '',
    width: '',
    stairs: '',
  })

  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // url 형식 : /review/edit?reviewId=2
  const searchParams = useSearchParams()
  const reviewId = Number(searchParams.get('reviewId'))

  // 기존 리뷰 내용 불러오기
  const fetchReviewData = async (reviewId: Number) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single()

    if (error) {
      alert('리뷰 불러오기 실패')
      return
    }
    return data || null
  }

  useEffect(() => {
    const loadReview = async () => {
      const reviewData = await fetchReviewData(reviewId)
      if (reviewData) {
        setPlaceId(reviewData.place_id)
        setRating(reviewData.rating)
        setContent(reviewData.content)
        setOptions({
          slope: reviewData.slope,
          width: reviewData.width,
          stairs: reviewData.stairs,
        })
      }
    }
    loadReview()
  }, [])

  // 리뷰 수정 내용 업데이트
  const handleSubmit = async () => {
    if (loading) return
    if (!rating) return alert('별점을 선택해주세요')
    if (!options.slope || !options.width || !options.stairs)
      return alert('보행 환경을 선택해주세요')
    if (!content) return alert('내용을 입력해주세요')

    setLoading(true)
    const { data: reviewData, error: reviewError } = await supabase
      .from('reviews')
      .update({
        //user_id: userId,
        user_id: '0ba3c127-607e-4644-96fd-a186c7096422',
        place_id: placeId,
        rating,
        content,
        slope: options.slope,
        width: options.width,
        stairs: options.stairs,
      })
      .select()
      .single()

    if (reviewError) {
      setLoading(false)
      console.error(reviewError)
      return alert('리뷰 저장 실패')
    }

    const reviewId = reviewData.id
    if (media.length > 0) {
      const mediaRows = media.map((media) => ({
        review_id: reviewId,
        file_url: media.url,
        file_type: 'image', // 필요하면 분기
      }))

      const { error: mediaError } = await supabase
        .from('media')
        .insert(mediaRows)
      if (mediaError) {
        console.error(mediaError)
        setLoading(false)
        return alert('사진 저장 실패')
      }
    }

    setLoading(false)
    alert('수정 완료!')
    router.push('/')
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
            <div>장소명</div>
            <div>주소</div>
          </div>
        </div>

        <div className="text-xl font-bold">전체 평점</div>
        <div className="p-4">
          <RatingSelector rating={rating} setRating={setRating} />
        </div>

        <div className="text-xl font-bold py-4">보행 환경 체크</div>
        <div className="border rounded-xl mb-6 p-6 flex flex-col text-gray-400">
          <OptionSelector options={options} onChange={setOptions} />
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
              setMedia((prev) => [...prev, ...urls])
            }
            onRemove={(urls: { url: string; path: string }[]) => setMedia(urls)}
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
