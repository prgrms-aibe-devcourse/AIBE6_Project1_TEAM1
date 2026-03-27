'use client'

export default async function DeleteReview(
  supabase: any,
  reviewId: number,
): Promise<void> {
  //
  // Storage path 추출 함수
  function extractPathFromUrl(url: string, bucketName: string): string {
    const parts = url.split(`/storage/v1/object/public/${bucketName}/`)
    if (parts.length < 2) return ''
    return parts[1]
  }

  // 1. media 테이블 조회
  const { data: mediaData, error: fetchError } = await supabase
    .from('media')
    .select('file_url')
    .eq('review_id', reviewId)

  if (fetchError) {
    console.error('파일 정보 조회 실패:', fetchError)
    alert('파일 정보 조회 실패')
    return
  }

  // 2. media가 있을 때만 Storage 삭제 & media 레코드 삭제
  if (mediaData && mediaData.length > 0) {
    // 3-1 Storage 삭제
    const paths: string[] = mediaData
      .map((item: { file_url: string }) =>
        extractPathFromUrl(item.file_url, 'media-storage'),
      )
      .filter((path: string) => path !== '')

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

    // 3-2 media 레코드 삭제
    const { error: mediaError } = await supabase
      .from('media')
      .delete()
      .eq('review_id', reviewId)

    if (mediaError) {
      console.error('Media 레코드 삭제 실패:', mediaError)
      alert('첨부기록 삭제 실패')
      return
    }
  }

  // 4. 리뷰 삭제
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
