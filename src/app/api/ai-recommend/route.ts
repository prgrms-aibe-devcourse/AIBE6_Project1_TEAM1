import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// ─── 타입 정의 (프론트에서도 import 가능) ───
export interface AIPlace {
  order: number
  name: string
  category: string
  desc: string
  duration: string
  walkInfo: string | null
  transitFare: number | null
}

export interface AIRecommendResponse {
  course: AIPlace[]
  totalWalkDistance: string
  totalPlaces: number
  totalTransitFare: number
}

// ─── Gemini 클라이언트 ───
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  // 1. 입력값 파싱
  const { station, themes, totalMinutes, includeMeal } = await request.json()

  // 2. 입력값 검증
  if (!station || !themes || themes.length === 0) {
    return NextResponse.json(
      { error: '출발지와 테마를 선택해주세요.' },
      { status: 400 },
    )
  }

  // 3. 시간 포맷 변환
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const timeLabel =
    totalMinutes >= 720
      ? '하루 (약 12시간)'
      : m > 0
        ? `${h}시간 ${m}분`
        : `${h}시간`

  const isFullDay = totalMinutes >= 720

  // 4. 프롬프트 생성
  const prompt = `너는 서울 여행 코스 추천 전문가다.
아래 조건에 맞는 여행 코스를 추천하고, 반드시 다음 JSON 형식의 순수 JSON만 응답해라.
마크다운 코드블록, 설명, 추가 텍스트를 절대 사용하지 마라. JSON만 반환해라.

조건:
- 출발지: ${station}
- 선호 테마: ${themes.join(', ')}
- 총 가용 시간: ${timeLabel}
- 식사 포함: ${includeMeal ? '예 (맛집 1곳 포함)' : '아니오'}${isFullDay ? '\n- 하루 코스: 저녁에 가기 좋은 장소(야경 명소, 저녁 맛집, 루프탑 바 등) 1곳을 코스 후반부에 반드시 포함' : ''}

규칙:
- 첫 번째 장소는 반드시 사용자가 입력한 출발지이고 walkInfo는 null
- 이후 장소들은 도보 또는 대중교통(버스, 지하철)으로 이동 가능한 실제 존재하는 장소
- 출발지 근방에만 머물지 말고 서울 전역을 활용하여 다양한 지역(구)의 장소를 추천해라. 10~20km 떨어진 곳도 지하철로 30분이면 이동 가능하므로 적극 활용
- 이동 수단 선택 기준:
  · 0~1km: 도보
  · 2km 이상: 지하철 우선 (빠르고 정시성 높음). 지하철역이 먼 곳만 버스 사용
  · 코스 전체에서 지하철과 버스를 골고루 섞어 사용 (버스만 또는 지하철만 편중 금지)
- 총 ${timeLabel} 안에 이동 시간 + 머무는 시간을 모두 포함하여 소화 가능한 수 (보통 4~6곳${isFullDay ? ', 하루 코스는 6~8곳' : ''})
- 각 장소 머무는 시간 + 이동 시간 합계가 총 가용 시간에 맞게
- walkInfo에 이동 수단과 소요 시간을 표시 (예: "도보 8분(0.5km)", "버스 15분(3.2km)", "지하철 25분(5역)")
- totalWalkDistance: 도보로만 이동한 구간의 거리 합산 (대중교통 거리는 제외). walkInfo에서 도보만 추출하여 계산
  · 예: walkInfo가 "도보 8분(0.5km)", "지하철 25분", "도보 5분(0.3km)"이면 totalWalkDistance = "0.8km" (0.5 + 0.3)
  · 대중교통(버스, 지하철)은 거리 계산에서 제외
- transitFare 요금 규칙:
  · 도보 구간은 0, 출발지는 null
  · 버스 기본요금: 1,500원 / 지하철 기본요금: 1,550원 (교통카드 기준, 고정값)
  · 환승 할인: 이전 대중교통 하차 후 30분 이내 재승차 시 무료 환승 (최대 4회). 단, 그 사이 장소에 머무는 시간(duration)이 30분을 초과하면 환승이 끊어지므로 새로운 기본요금 부과
  · totalTransitFare = 각 구간 transitFare의 합산
- 선호 테마(${themes.join(', ')})에 부합하는 장소 위주
- 한국어로만 응답

반드시 다음 형식으로만 응답하고 다른 텍스트는 절대 포함하지 마라:
{"course":[{"order":1,"name":"출발지이름","category":"출발지","desc":"출발지","duration":"5분","walkInfo":null,"transitFare":null},{"order":2,"name":"장소1","category":"카테고리","desc":"설명","duration":"XY분","walkInfo":"지하철25분(5역)","transitFare":1550},{"order":3,"name":"장소2","category":"카테고리","desc":"설명","duration":"XY분","walkInfo":"도보8분(0.5km)","transitFare":0},{"order":4,"name":"장소3","category":"카테고리","desc":"설명","duration":"XY분","walkInfo":"도보12분(0.8km)","transitFare":0}],"totalWalkDistance":"1.3km","totalPlaces":4,"totalTransitFare":1550}`

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
  }
}
