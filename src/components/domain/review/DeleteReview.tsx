import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteReview(reviewId: Number) {
  const supabase = createClient()
  const router = useRouter()

  //  삭제 버튼 눌렀을 때 (참고용)
  //   const onDeleteClick = () => {
  //     if (window.confirm('리뷰를 삭제하시겠습니까?')) {
  //       // 삭제 함수 ex) dispatch(delete(data.id));
  //       ()
  //       alert('삭제완료!')
  //     } else {
  //       alert('삭제 취소')
  //     }
  //   }

  const deleteData = async () => {
    // Storage에서 첨부한 파일 제거

    // media 테이블에서 파일 첨부 기록 제거

    // reviews 테이블에서 리뷰 제거
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .match({ id: reviewId })
    if (error) {
      alert('리뷰 삭제 실패')
    }
  }

  alert('삭제되었습니다.')
  router.push('/') // 삭제 후 이동할 페이지로 변경하기
}
