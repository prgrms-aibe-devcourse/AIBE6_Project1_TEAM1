import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query')
<<<<<<< HEAD
  const categoryGroupCode = req.nextUrl.searchParams.get('categoryGroupCode')
=======
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)

  if (!query || !query.trim()) {
    return NextResponse.json(
      { message: 'query 파라미터가 필요합니다.' },
      { status: 400 },
    )
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY

  if (!restApiKey) {
    return NextResponse.json(
      { message: 'KAKAO_REST_API_KEY가 설정되지 않았습니다.' },
      { status: 500 },
    )
  }

  try {
<<<<<<< HEAD
    const kakaoParams = new URLSearchParams({
      query: query.trim(),
    })

    if (categoryGroupCode) {
      kakaoParams.set('category_group_code', categoryGroupCode)
    }

    const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?${kakaoParams.toString()}`
=======
    const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      query,
    )}`
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)

    const response = await fetch(kakaoUrl, {
      method: 'GET',
      headers: {
        Authorization: `KakaoAK ${restApiKey}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()

      return NextResponse.json(
        {
          message: '카카오 API 요청에 실패했습니다.',
          detail: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('카카오 장소 검색 오류:', error)

    return NextResponse.json(
      { message: '서버에서 장소 검색 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
