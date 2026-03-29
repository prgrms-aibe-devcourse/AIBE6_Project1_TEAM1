'use client'

import DeleteReview from '@/components/domain/review/DeleteReview'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

///////////////////////////////
// 테스트 및 참고용 페이지입니다.//
///////////////////////////////

export default function ReviewDeletePage() {
  // url 형식 : /review/delete?reviewId="리뷰번호"

  //////////////////// 다른 페이지에서 구현될 내용 + 디버깅용 코드 //////////////////////////
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const reviewIdParam = searchParams.get('reviewId')
  const reviewId = reviewIdParam ? Number(reviewIdParam) : null
  const { openModal } = useModalStore()

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
        //router.push('/')
      }
    }
    checkReview()
  }, [reviewId])
  ///////////////////////////////////////////////////////////////////////////////

  /////////////////////////// DeleteReview 사용 예시 /////////////////////////////
  const handleDelete = async () => {
    if (!reviewId) return
    await DeleteReview(supabase, reviewId)
    // 삭제 후 라우팅 어디로?
    router.push('/')
  }

  return (
    <button
      className="w-1/3 cursor-pointer"
      onClick={() =>
        openModal({
          type: 'confirm',
          variant: 'danger',
          title: '리뷰를 삭제하시겠습니까?',
          description: '삭제된 데이터는 복구할 수 없습니다.',
          confirmText: '삭제',
          cancelText: '취소',
          onConfirm: handleDelete,
        })
      }
    >
      리뷰 삭제
    </button>
  )
}
