'use client'

export default async function DeleteReview(
  supabase: any,
  reviewId: number,
): Promise<void> {
  // 1. image 테이블 조회
  const { data: imageData, error: fetchError } = await supabase
    .from('images')
    .select('file_url', 'file_path')
    .eq('review_id', reviewId)

  if (fetchError) {
    console.error('파일 정보 조회 실패:', fetchError)
    alert('파일 정보 조회 실패')
    return
  }

  // 2. image가 있을 때만 Storage 삭제 & image 레코드 삭제
  if (imageData && imageData.length > 0) {
    // 3-1 Storage 삭제
    const paths: string[] = imageData.map(
      (item: { file_url: string; file_path: string }) => item.file_path,
    )

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('media-storage')
        .remove(paths)

      if (storageError) {
        console.error('Storage 삭제 실패:', storageError)
        alert('첨부파일 삭제 실패')
        return
      }
    }

    // 3-2 image 레코드 삭제
    const { error: imageError } = await supabase
      .from('images')
      .delete()
      .eq('review_id', reviewId)

    if (imageError) {
      console.error('Image 레코드 삭제 실패:', imageError)
      alert('첨부기록 삭제 실패')
      return
    }
  }

  // 4. routes 레코드 삭제
  const { error: routeError } = await supabase
    .from('routes')
    .delete()
    .eq('review_id', reviewId)

  if (routeError) {
    console.error('routes 레코드 삭제 실패:', routeError)
    alert('경로리뷰 삭제 실패')
    return
  }

  // 5. 리뷰 삭제
  const { error: reviewError } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (reviewError) {
    console.error('리뷰 삭제 실패:', reviewError)
    alert('리뷰 삭제 실패')
    return
  }

  alert('삭제 완료!')
  return
}
