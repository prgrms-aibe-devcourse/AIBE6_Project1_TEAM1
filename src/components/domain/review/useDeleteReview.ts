// 파일명: deleteReview.ts
'use client'

import { SupabaseClient } from '@supabase/supabase-js'

// 리뷰 삭제 함수
export async function deleteReview(
  supabase: SupabaseClient,
  reviewId: number,
  openModal: any,
  router: any,
) {
  if (!reviewId) return

  // 1. image 테이블 조회
  const { data: imageData, error: fetchError } = await supabase
    .from('images')
    .select('file_url, file_path')
    .eq('review_id', reviewId)

  if (fetchError) {
    console.error('파일 정보 조회 실패:', fetchError)
    openModal({
      type: 'alert',
      variant: 'danger',
      title: '파일 정보 조회 실패',
      description: '파일 정보 조회에 실패했습니다.',
      onConfirm: () => {},
    })
    return
  }

  // 2. image가 있을 때만 Storage 삭제 & image 레코드 삭제
  if (imageData && imageData.length > 0) {
    // 2-1 Storage 삭제
    const paths: string[] = imageData.map(
      (item: { file_url: string; file_path: string }) => item.file_path,
    )

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('media-storage')
        .remove(paths)

      if (storageError) {
        console.error('Storage 삭제 실패:', storageError)
        openModal({
          type: 'alert',
          variant: 'danger',
          title: 'Storage 삭제 실패',
          description: 'Storage 삭제에 실패했습니다.',
          onConfirm: () => {},
        })
      }
    }

    // 2-2 image 레코드 삭제
    const { error: imageError } = await supabase
      .from('images')
      .delete()
      .eq('review_id', reviewId)

    if (imageError) {
      console.error('Image 레코드 삭제 실패:', imageError)
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '첨부 기록 삭제 실패',
        description: '첨부 기록 삭제에 실패했습니다.',
        onConfirm: () => {},
      })
    }
  }

  // 3. routes 레코드 삭제
  const { error: routeError } = await supabase
    .from('routes')
    .delete()
    .eq('review_id', reviewId)

  if (routeError) {
    console.error('routes 레코드 삭제 실패:', routeError)
    openModal({
      type: 'alert',
      variant: 'danger',
      title: '경로 기록 삭제 실패',
      description: '경로 기록 삭제에 실패했습니다.',
      onConfirm: () => {},
    })
  }

  // 4. 리뷰 삭제
  const { error: reviewError } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (reviewError) {
    console.error('리뷰 삭제 실패:', reviewError)
    openModal({
      type: 'alert',
      variant: 'danger',
      title: '리뷰 삭제 실패',
      description: '리뷰 삭제에 실패했습니다.',
      onConfirm: () => {},
    })
    return
  }

  // 5. 완료 모달
  openModal({
    type: 'alert',
    variant: 'primary',
    title: '리뷰 삭제 성공',
    description: '삭제 완료!',
    onConfirm: () => {
      router.push('/mypage/reviews')
    },
  })
}
