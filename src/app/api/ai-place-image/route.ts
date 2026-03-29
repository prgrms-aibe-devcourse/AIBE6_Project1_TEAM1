import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: 'name 파라미터가 필요합니다.' },
      { status: 400 },
    )
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY
  if (!restApiKey) {
    return NextResponse.json(
      { error: 'KAKAO_REST_API_KEY 미설정' },
      { status: 500 },
    )
  }

  try {
    const params = new URLSearchParams({ query: name.trim(), size: '1' })
    const res = await fetch(
      `https://dapi.kakao.com/v2/search/image?${params.toString()}`,
      { headers: { Authorization: `KakaoAK ${restApiKey}` } },
    )

    if (!res.ok) {
      return NextResponse.json({ thumbnailUrl: null })
    }

    const data = await res.json()
    const thumbnailUrl: string | null =
      data.documents?.[0]?.thumbnail_url ?? null
    return NextResponse.json({ thumbnailUrl })
  } catch {
    return NextResponse.json({ thumbnailUrl: null })
  }
}
