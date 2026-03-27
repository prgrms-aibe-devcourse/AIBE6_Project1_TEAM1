'use client'

import DeleteReview from '@/components/domain/review/DeleteReview'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

///////////////////////////////
// 테스트 및 참고용 페이지입니다.//
///////////////////////////////

export default function ReviewDeletePage() {
  // url 형식 : /review/delete?reviewId="리뷰번호"
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  const reviewIdParam = searchParams.get('reviewId')
  const reviewId = reviewIdParam ? Number(reviewIdParam) : null

  useEffect(() => {
    const checkReview = async () => {
      if (!reviewId) return

      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (!data) {
        alert('리뷰가 없습니다')
        router.push('/')
      }
    }
    checkReview()
  }, [reviewId])

  const handleClick = async () => {
    if (!reviewId) return

    await DeleteReview(supabase, reviewId)
    router.push('/')
  }

  return (
    <button className="w-1/3 cursor-pointer" onClick={handleClick}>
      리뷰 삭제
    </button>
  )
}
