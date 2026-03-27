'use client'

import { createClient } from '@/utils/supabase/client'
import {
  AlignVerticalSpaceAround,
  ArrowRight,
  ArrowUpNarrowWide,
  Minus,
  Mountain,
  MoveHorizontal,
  TrendingUp,
} from 'lucide-react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ReviewPage() {
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

  const {
    user_id: reviewUserId,
    place_id,
    rating,
    content,
    slope,
    width,
    stairs,
  } = reviewData
  const options = { slope, width, stairs }

  // 리뷰 수정페이지로 라우팅
  const handleEdit = () => {
    router.push(`/review/edit?${reviewId}`)
  }

  // 리뷰 삭제 페이지로 라우팅 -> 추후에 바로 삭제로 수정
  const handleDelete = () => {
    router.push(`/review/delete?reviewId=${reviewId}`)
  }

  // Option 표시용
  const Option = ({
    icon,
    label,
    selected,
  }: {
    icon: React.ReactNode
    label: string
    selected: boolean
  }) => (
    <button
      className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl border w-full
        ${selected ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}
      `}
    >
      <div className="text-gray-700">{icon}</div>
      <span className="text-sm">{label}</span>
    </button>
  )

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
          <h1 className="inline text-2xl p-4 font-bold">리뷰 내용</h1>
        </div>

        <div className="border rounded-xl mb-6 p-6 flex flex-row gap-4 text-gray-400">
          <div>
            <Image src="/icon.svg" width={50} height={50} alt="card image" />
          </div>
          <div className="flex-col">
            <div>디버깅용: place_id = {place_id}</div>
            <div>주소</div>
          </div>
        </div>

        <div className="text-xl font-bold">전체 평점</div>
        <div className="p-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-2xl ${
                  star <= rating ? 'text-black' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="text-xl font-bold py-4">보행 환경</div>
        <div className="border rounded-xl mb-6 p-6 flex flex-col text-gray-400">
          <div>
            <p className="text-sm mb-3 text-gray-600">경사도</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <Option
                icon={<ArrowRight size={18} />}
                label="완만"
                selected={options.slope === '완만'}
              />
              <Option
                icon={<TrendingUp size={18} />}
                label="보통"
                selected={options.slope === '보통'}
              />
              <Option
                icon={<Mountain size={18} />}
                label="가파름"
                selected={options.slope === '가파름'}
              />
            </div>
            <div>
              <p className="text-sm mb-3 text-gray-600">인도 폭</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Option
                  icon={<MoveHorizontal size={18} />}
                  label="넓음"
                  selected={options.width === '넓음'}
                />
                <Option
                  icon={<AlignVerticalSpaceAround size={18} />}
                  label="좁음"
                  selected={options.width === '좁음'}
                />
              </div>
            </div>
            <div>
              <p className="text-sm mb-3 text-gray-600">계단 유무</p>
              <div className="grid grid-cols-2 gap-3">
                <Option
                  icon={<ArrowUpNarrowWide size={18} />}
                  label="있음"
                  selected={options.stairs === '있음'}
                />
                <Option
                  icon={<Minus size={18} />}
                  label="없음"
                  selected={options.stairs === '없음'}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-xl font-bold py-4">리뷰 내용</div>
        <div className="mb-6">{content}</div>
        <div className="text-xl font-bold py-4">사진</div>
        <div className="mb-6">
          {mediaData.map((url, index) => (
            <img key={index} src={url} alt={`img-${index}`} />
          ))}
        </div>
        {userId === reviewUserId && (
          <div>
            <button
              className="w-1/2 bg-black text-white py-3 rounded-lg mb-6 cursor-pointer"
              onClick={handleEdit}
            >
              수정
            </button>
            <button
              className="w-1/2 bg-red-500 text-white py-3 border rounded-lg mb-6 cursor-pointer"
              onClick={handleDelete}
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
