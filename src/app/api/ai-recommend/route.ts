import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 0 // 10분 캐싱 (테스트용)

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
  const prompt = `너는 대한민국 전국 여행 코스 추천 전문가다.
아래 조건에 맞는 여행 코스를 추천하고, 반드시 다음 JSON 형식의 순수 JSON만 응답해라.
마크다운 코드블록, 설명, 추가 텍스트를 절대 사용하지 마라. JSON만 반환해라.

조건:
- 출발지: ${station}
- 선호 테마: ${themes.join(', ')}
- 총 가용 시간: ${timeLabel}
- 식사 포함: ${includeMeal ? '예 (맛집 1곳 포함)' : '아니오'}${isFullDay ? '\n- 하루 코스: 저녁에 가기 좋은 장소(야경 명소, 저녁 맛집, 루프탑 바 등) 1곳을 코스 후반부에 반드시 포함' : ''}

규칙:
- 첫 번째 장소는 반드시 사용자가 입력한 출발지이고 walkInfo는 null
- 이후 장소들은 도보 또는 대중교통(버스, 지하철, 시외버스 등)으로 이동 가능한 실제 존재하는 장소
- 출발지 근방에만 머물지 말고 해당 지역(시/군/구) 전체를 활용하여 다양한 장소를 추천해라. 출발지가 서울이면 서울 전역, 부산이면 부산 전역, 제주면 제주 전역에서 추천해라. 대중교통으로 30~50분 이내 이동 가능한 장소도 적극 활용해라.
-주의:장소를 추천받을때 ' -거리 , -로 ' 같은(예:동성로,카페 거리) 애매한 길거리 이름을 추천 하지말고 "카카오맵 API의 'keyword' 검색 결과에서 가장 상단에 노출되는 공식 명칭을 사용해줘."
- 장소가 타지역의 동일 상호의 장소가 추천되지 않도록 지금 출발지기준 같은지역에 있는 장소로 한정해서 추천하게 끔 설정
- 이동 수단 선택 기준:
  · 0~1km: 도보
  · 2km 이상: 해당 지역 실정에 맞는 대중교통 우선 (서울·부산은 지하철, 제주·지방은 시내버스·택시)
  · 코스 전체에서 이동수단을 골고루 섞어 사용 (한 가지 수단에만 편중 금지)
- 총 ${timeLabel} 안에 이동 시간 + 머무는 시간을 모두 포함하여 소화 가능한 수 (보통 4~6곳${isFullDay ? ', 하루 코스는 6~8곳' : ''})
- 각 장소 머무는 시간 + 이동 시간 합계가 총 가용 시간에 맞게
- walkInfo에 이동 수단과 소요 시간을 표시 (예: "도보 8분(0.5km)", "버스 15분(3.2km)", "지하철 25분(5역)")
- totalWalkDistance: 도보로만 이동한 구간의 거리 합산 (대중교통 거리는 제외). walkInfo에서 도보만 추출하여 계산
  · 예: walkInfo가 "도보 8분(0.5km)", "지하철 25분", "도보 5분(0.3km)"이면 totalWalkDistance = "0.8km" (0.5 + 0.3)
  · 대중교통(버스, 지하철)은 거리 계산에서 제외
- transitFare 요금 규칙:
  · 도보 구간은 0, 출발지는 null
  · 대중교통(버스·지하철 무관): 1,500원 고정
  · totalTransitFare = 각 구간 transitFare의 합산
- 선호 테마(${themes.join(', ')})에 부합하는 장소 위주
- 한국어로만 응답

반드시 다음 형식으로만 응답하고 다른 텍스트는 절대 포함하지 마라:
{"course":[{"order":1,"name":"출발지이름","category":"출발지","desc":"출발지","duration":"5분","walkInfo":null,"transitFare":null},{"order":2,"name":"장소1","category":"카테고리","desc":"설명","duration":"XY분","walkInfo":"지하철25분(5역)","transitFare":1500},{"order":3,"name":"장소2","category":"카테고리","desc":"설명","duration":"XY분","walkInfo":"도보8분(0.5km)","transitFare":0},{"order":4,"name":"장소3","category":"카테고리","desc":"설명","duration":"XY분","walkInfo":"도보12분(0.8km)","transitFare":0}],"totalWalkDistance":"1.3km","totalPlaces":4,"totalTransitFare":1500}`

  // 5. Gemini API 호출
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 800,
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

// ─── GET: 인기 출발지 추천 ───
export async function GET(request: NextRequest) {
  // 대한민국 인기 여행지 후보 (전국 40선)
  const popularSpots = [
    // 서울 20곳
    '홍대입구역 ',
    '연남동 경의선 숲길',
    '성수역',
    '명동역',
    '강남역 ',
    '이태원역',
    '광화문역',
    '북촌한옥마을',
    '동대문 디자인플라자',
    '신촌역',
    '을지로3가역 ',
    '서울숲역 ',
    '잠실역·롯데월드타워',
    '청계천 ',
    '남산 & N서울타워',
    '서촌한옥마을',
    '쌈지길',
    '여의도한강공원',
    '스타필드 코엑스몰',
    '북한산국립공원',
    // 제주 3곳
    '제주 국제공항',
    '서귀포 중문관광단지',
    '제주 애월 카페거리',
    // 부산 5곳
    '해운대 해수욕장',
    '광안리 해수욕장',
    '감천문화마을',
    '부산 자갈치시장',
    '태종대유원지 ',
    // 전국 KTX/대중교통 여행지 12곳
    '경주역',
    '전주 한옥마을',
    '다이소 대구동성로점',
    '수원 화성',
    '강릉 경포대',
    '춘천 남이섬',
    '여수 엑스포역',
    '대전 성심당본점',
    '안동 하회마을',
    '부여 백제문화단지',
    '순천역 ',
    '춘천역 경춘선',
  ]

  // 매번 배열을 섞어서 5개의 장소를 랜덤으로 직접 선택하여 프롬프트에 주입
  const shuffled = popularSpots.sort(() => 0.5 - Math.random())
  const selectedSpots = shuffled.slice(0, 5)

  const seed = Math.floor(Math.random() * 10000)

  try {
    const prompt = `대한민국 인기 여행 출발지 정보 포맷팅 (시드:${seed})
사용자에게 보여줄 대한민국의 인기 여행 출발지 5곳의 교통 정보를 포맷팅해주세요.
대상 장소: [ ${selectedSpots.join(', ')} ]

요청사항:
위 5개 장소를 그대로 반환하되, 각 장소에 대한 access(교통정보)를 작성해서 JSON으로 반환하세요.
- access(교통정보)는 반드시 15자 이내로 아주 짧게 핵심만 요약하세요. (예: "KTX 동대구역", "제주공항 20분", "지하철 2호선", "버스터미널 도보")
- 장소명(name)은 제시된 장소 이름을 그대로 사용하거나 더 자연스럽게 살짝만 수정하세요.

반드시 이 형식으로만 응답: {"locations":[{"name":"장소명","access":"교통정보"}]}`

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        temperature: 1.5,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    })

    const result = await model.generateContent(prompt)
    const raw = result.response.text()
    const data = JSON.parse(raw)

    return NextResponse.json(data.locations ?? [])
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : ''
    console.error('[ai-popular] Error:', message)
    console.error('[ai-popular] Stack:', stack)
    console.error('[ai-popular] Full error:', err)

    // 디버깅용: 에러도 함께 반환 (프로덕션에서는 제거)
    return NextResponse.json({
      error: message,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      fallbackLocations: [
        { name: '을지로3가역', access: '2·3호선' },
        { name: '성수역', access: '2호선' },
        { name: '경복궁', access: '3호선 경복궁역' },
        { name: '강남역', access: '2호선' },
        { name: '홍대', access: '2호선 홍대입구역' },
      ],
    })
  }
}
