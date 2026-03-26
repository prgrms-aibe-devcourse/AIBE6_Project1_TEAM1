import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// ─── 타입 정의 ───
export interface AIPlace {
  order: number
  name: string
  category: string
  desc: string
  duration: string
  walkInfo: string | null
}

export interface AIRecommendResponse {
  course: AIPlace[]
  totalWalkDistance: string
  totalPlaces: number
}

// ─── OpenAI 클라이언트 (서버 전용 — OPENAI_API_KEY는 NEXT_PUBLIC_ 없이 서버에서만 읽힘) ───
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  // 1. 프론트에서 넘어온 입력값 파싱
  const { station, themes, totalMinutes, includeMeal } = await request.json()

  // 2. 입력값 검증
  if (!station || !themes || themes.length === 0) {
    return NextResponse.json(
      { error: '출발지와 테마를 선택해주세요.' },
      { status: 400 },
    )
  }

  // 3. 시간 포맷 변환 (150 → "2시간 30분")
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const timeLabel = m > 0 ? `${h}시간 ${m}분` : `${h}시간`

  // 4. 프롬프트 생성
  const userPrompt = `
출발지: ${station}
선호 테마: ${themes.join(', ')}
총 가용 시간: ${timeLabel}
식사 포함: ${includeMeal ? '예 (맛집 1곳 포함)' : '아니오'}

위 조건에 맞는 서울 도보 여행 코스를 추천해줘.
반드시 아래 JSON 형식으로만 응답해:

{
  "course": [
    {
      "order": 1,
      "name": "장소명",
      "category": "카테고리",
      "desc": "한 두 문장 설명",
      "duration": "XX분",
      "walkInfo": null
    },
    {
      "order": 2,
      "name": "장소명",
      "category": "카테고리",
      "desc": "한 두 문장 설명",
      "duration": "XX분",
      "walkInfo": "도보 X분 (X.Xkm)"
    }
  ],
  "totalWalkDistance": "X.Xkm",
  "totalPlaces": 5
}

조건:
- 첫 번째 장소는 반드시 출발역 자체로 하고 walkInfo는 null
- 이후 장소들은 도보 1km 이내 이동 가능한 실제 존재하는 장소
- 총 ${timeLabel} 안에 소화 가능한 수의 장소 (보통 4~6곳)
- 각 장소 머무는 시간 합계 + 도보 이동 시간 합계 = 총 가용 시간에 맞게
- 선호 테마(${themes.join(', ')})에 부합하는 장소 위주로 구성
- 한국어로만 응답
`

  // 5. OpenAI API 호출
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '너는 서울 도보 여행 코스 추천 전문가다. 사용자가 요청한 조건에 맞는 실제 존재하는 장소로 코스를 구성하고, 반드시 순수 JSON만 응답한다. 마크다운 코드블록(```json)을 절대 사용하지 않는다.',
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    })

    // 6. 응답 파싱
    const raw = completion.choices[0].message.content
    const data: AIRecommendResponse = JSON.parse(raw!)
    return NextResponse.json(data)
  } catch (err: unknown) {
    // OpenAI 에러 메시지를 그대로 반환해서 디버깅 가능하게
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ai-recommend] OpenAI error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
