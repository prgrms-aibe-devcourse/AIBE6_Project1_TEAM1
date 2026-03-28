'use client'

import MediaUploader from '@/components/domain/review/MediaUploader'
import OptionSelector from '@/components/domain/review/OptionSelector'
import RatingSelector from '@/components/domain/review/RatingSelector'
import { createClient } from '@/utils/supabase/client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReviewEditPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const reviewId = Number(searchParams.get('reviewId'))
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  // url 형식 : /review/view?reviewId="리뷰번호"

  // 유저 정보 가져오기
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUserId(user?.id ?? null)
    }
    getUser()
  }, [])

  const [reviewData, setReviewData] = useState(null)
  const [mediaData, setMediaData] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<{ url: string; path: string }[]>([])
  const [options, setOptions] = useState({
    slope: '',
    width: '',
    stairs: '',
  })

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (error) {
        alert('리뷰 불러오기 실패')
        setLoading(false)
        return
      }

      if (!data) {
        alert('리뷰가 없습니다')
        setLoading(false)
        return
      }

      setReviewData(data)
      const placeId = reviewData.place_id
      setLoading(false)
    }

    const fetchMedia = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('media')
        .select('file_url')
        .eq('review_id', reviewId)
      if (error) {
        alert('사진 불러오기 실패')
        setLoading(false)
        return
      }

      if (!data) return
      const urls = data
        .map((item) => item.file_url)
        .filter((url): url is string => url !== null)

      setMediaData(urls)
      setLoading(false)
    }

    fetchReview()
    fetchMedia()
  }, [])

  if (loading) return <p>Loading...</p>
  if (!reviewData) return <p>리뷰가 없습니다</p>

  // const {
  //   user_id: reviewUserId,
  //   place_id: placeId,
  //   rating,
  //   content,
  //   slope,
  //   width,
  //   stairs,
  // } = reviewData
  // const options = { slope, width, stairs }

  // 리뷰 수정 내용 업데이트
  const handleSubmit = async () => {
    if (loading) return
    if (!rating) return alert('별점을 선택해주세요')
    if (!options.slope || !options.width || !options.stairs)
      return alert('보행 환경을 선택해주세요')
    if (!content) return alert('내용을 입력해주세요')

    setLoading(true)
    const { data: newReviewData, error: reviewError } = await supabase
      .from('reviews')
      .update({
        user_id: userId,
        place_id: reviewData.place_id,
        rating,
        content,
        slope: options.slope,
        width: options.width,
        stairs: options.stairs,
      })
      .eq('id', reviewId)

    if (reviewError) {
      setLoading(false)
      console.error(reviewError)
      return alert('리뷰 저장 실패')
    }

    if (mediaData.length > 0) {
      const mediaRows = mediaData.map((media) => ({
        review_id: reviewId,
        file_url: media,
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

  const handleCancel = () => {
    router.back()
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
          className="w-1/2 bg-black text-white py-3 rounded-lg mb-6 cursor-pointer"
          onClick={handleSubmit}
        >
          {loading ? '등록 중...' : '수정'}
        </button>
        <button
          className="w-1/2 bg-white text-black py-3 border rounded-lg mb-6 cursor-pointer"
          onClick={handleCancel}
        >
          취소
        </button>
      </div>
    </div>
  )
}
