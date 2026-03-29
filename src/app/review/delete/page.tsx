'use client'

import { deleteReview } from '@/components/domain/review/useDeleteReview' // 함수형으로 변경
import { useModalStore } from '@/store/useModalStore'
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
  const { openModal } = useModalStore()

  // 리뷰 존재 여부 체크
  useEffect(() => {
    const checkReview = async () => {
      if (!reviewId) return

      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single()

      if (!data) {
        openModal({
          type: 'alert',
          variant: 'danger',
          title: '리뷰 없음',
          description: '리뷰가 없습니다',
          onConfirm: () => {
            router.push('/')
          },
        })
      }
    }
    checkReview()
  }, [reviewId, openModal, router, supabase])

  /////////////////////////// 삭제 버튼 /////////////////////////////
  const handleDelete = async () => {
    if (!reviewId) return
    await deleteReview(supabase, reviewId, openModal, router)
  }

  return (
    <button
      className="w-1/3 cursor-pointer bg-red-500 text-white px-4 py-2 rounded"
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
