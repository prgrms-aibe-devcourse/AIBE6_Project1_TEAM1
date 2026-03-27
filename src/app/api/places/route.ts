import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query')
<<<<<<< HEAD
<<<<<<< HEAD
  const categoryGroupCode = req.nextUrl.searchParams.get('categoryGroupCode')
<<<<<<< HEAD
<<<<<<< HEAD
  const pageParam = req.nextUrl.searchParams.get('page')
  const sizeParam = req.nextUrl.searchParams.get('size')
=======
=======
>>>>>>> 6539aea (Feat: 페이지기능 구현)
=======
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
<<<<<<< HEAD
>>>>>>> c901d24 (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
=======
  const categoryGroupCode = req.nextUrl.searchParams.get('categoryGroupCode')
>>>>>>> 4986e65 (카테고리 수정)
<<<<<<< HEAD
>>>>>>> 56c7bc4 (카테고리 수정)
=======
=======
  const pageParam = req.nextUrl.searchParams.get('page')
  const sizeParam = req.nextUrl.searchParams.get('size')
>>>>>>> 3380091 (Feat: 페이지기능 구현)
>>>>>>> 6539aea (Feat: 페이지기능 구현)

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

  const page = Math.max(1, Number(pageParam) || 1)
<<<<<<< HEAD
  const size = Math.min(15, Math.max(1, Number(sizeParam) || 9))
=======
  const size = Math.min(15, Math.max(1, Number(sizeParam) || 15))
>>>>>>> 6539aea (Feat: 페이지기능 구현)

  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 4986e65 (카테고리 수정)
    const kakaoParams = new URLSearchParams({
      query: query.trim(),
      page: String(page),
      size: String(size),
    })

    if (categoryGroupCode) {
      kakaoParams.set('category_group_code', categoryGroupCode)
    }

    const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?${kakaoParams.toString()}`
<<<<<<< HEAD
=======
    const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      query,
    )}`
>>>>>>> 6e518ef (feat: 검색 결과 출력 기능 추가 및 카카오 API 연결)
=======
>>>>>>> 4986e65 (카테고리 수정)

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

    return NextResponse.json({
      documents: data.documents ?? [],
      meta: data.meta ?? {
        is_end: true,
        pageable_count: 0,
        total_count: 0,
      },
    })
  } catch (error) {
    console.error('카카오 장소 검색 오류:', error)

    return NextResponse.json(
      { message: '서버에서 장소 검색 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
