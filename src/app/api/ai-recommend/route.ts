<<<<<<< HEAD
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// ─── 타입 정의 (프론트에서도 import 가능) ───
=======
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// ─── 타입 정의 ───
>>>>>>> 6c4a20c (Feat : Open AI api 연결)
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

<<<<<<< HEAD
// ─── Gemini 클라이언트 ───
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  // 1. 입력값 파싱
=======
// ─── OpenAI 클라이언트 (서버 전용 — OPENAI_API_KEY는 NEXT_PUBLIC_ 없이 서버에서만 읽힘) ───
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  // 1. 프론트에서 넘어온 입력값 파싱
>>>>>>> 6c4a20c (Feat : Open AI api 연결)
  const { station, themes, totalMinutes, includeMeal } = await request.json()

  // 2. 입력값 검증
  if (!station || !themes || themes.length === 0) {
    return NextResponse.json(
      { error: '출발지와 테마를 선택해주세요.' },
      { status: 400 },
    )
  }

<<<<<<< HEAD
  // 3. 시간 포맷 변환
=======
  // 3. 시간 포맷 변환 (150 → "2시간 30분")
>>>>>>> 6c4a20c (Feat : Open AI api 연결)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const timeLabel = m > 0 ? `${h}시간 ${m}분` : `${h}시간`

  // 4. 프롬프트 생성
<<<<<<< HEAD
  const prompt = `너는 서울 도보 여행 코스 추천 전문가다.
아래 조건에 맞는 도보 여행 코스를 추천하고, 반드시 다음 JSON 형식의 순수 JSON만 응답해라.
마크다운 코드블록, 설명, 추가 텍스트를 절대 사용하지 마라. JSON만 반환해라.

조건:
- 출발지: ${station}
- 선호 테마: ${themes.join(', ')}
- 총 가용 시간: ${timeLabel}
- 식사 포함: ${includeMeal ? '예 (맛집 1곳 포함)' : '아니오'}

규칙:
- 첫 번째 장소는 반드시 출발역이고 walkInfo는 null
- 이후 장소들은 이전 장소에서 도보 1km 이내의 실제 존재하는 장소
- 총 ${timeLabel} 안에 소화 가능한 수 (보통 4~6곳)
- 각 장소 머무는 시간 + 도보 이동 시간 합계가 총 가용 시간에 맞게
- 선호 테마(${themes.join(', ')})에 부합하는 장소 위주
- 한국어로만 응답

반드시 다음 형식으로만 응답하고 다른 텍스트는 절대 포함하지 마라:
{"course":[{"order":1,"name":"출발역이름","category":"지하철역","desc":"출발지","duration":"5분","walkInfo":null},{"order":2,"name":"장소1","category":"카테고리","desc":"설명","duration":"XY분","walkInfo":"도보X분(X.Xkm)"}],"totalWalkDistance":"X.Xkm","totalPlaces":5}`

  // 5. Gemini API 호출
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 6000,
        responseMimeType: 'application/json',
      },
    })

    console.log('[Prompt]:\n', prompt)

    const result = await model.generateContent(prompt)
    const raw = result.response.text()

    const usage = result.response.usageMetadata
    console.log('[Token Usage]', {
      입력토큰: usage?.promptTokenCount,
      출력토큰: usage?.candidatesTokenCount,
      총토큰: usage?.totalTokenCount,
    })
    console.log('[Gemini Response]:\n', raw)

    // JSON 파싱
    const data: AIRecommendResponse = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ai-recommend] Error:', message)
    return NextResponse.json({ error: `API 에러: ${message}` }, { status: 500 })
=======
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
>>>>>>> 6c4a20c (Feat : Open AI api 연결)
  }
}
