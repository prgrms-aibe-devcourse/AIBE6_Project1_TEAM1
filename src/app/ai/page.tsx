'use client'

// ─── Import: React ───
import { useState } from 'react'

// ─── Import: Layout 컴포넌트 ───
import GlobalHeader from '@/components/layout/GlobalHeader'
import PageContainer from '@/components/layout/PageContainer'

// ─── Import: AI 도메인 컴포넌트 ───
import AIFilterBadge from '@/components/domain/ai/AIFilterBadge'
import AIResultCard from '@/components/domain/ai/AIResultCard'
import AIStepIndicator from '@/components/domain/ai/AIStepIndicator'
import AITagButton from '@/components/domain/ai/AITagButton'
import AITimeSlider from '@/components/domain/ai/AITimeSlider'

// ─── Import: 아이콘 ───
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Footprints,
  Loader2,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react'

// ─── 상수 정의 ───

const STEPS = [
  { num: 1, label: '장소 선택' },
  { num: 2, label: '취향 선택' },
  { num: 3, label: '시간 설정' },
]

const POPULAR_STATIONS = [
  { name: '을지로3가역', line: '2·3호선' },
  { name: '성수역', line: '2호선' },
  { name: '연남동역', line: '경의중앙선' },
  { name: '익선동역', line: '1·3·5호선' },
  { name: '망원역', line: '6호선' },
]

const THEME_TAGS = [
  { emoji: '☕', label: '카페 투어' },
  { emoji: '📸', label: '사진 맛집' },
  { emoji: '🌿', label: '공원 산책' },
  { emoji: '🍜', label: '미식 투어' },
  { emoji: '🏛️', label: '문화 체험' },
  { emoji: '🎨', label: '예술 갤러리' },
  { emoji: '🛍️', label: '쇼핑 거리' },
  { emoji: '🌙', label: '야경 명소' },
  { emoji: '📚', label: '독립서점' },
  { emoji: '🧘', label: '힐링 코스' },
]

const DUMMY_RESULTS = [
  {
    order: 1,
    name: '성수역 출발',
    category: '출발지',
    desc: '2호선 성수역 3번 출구에서 시작합니다.',
    duration: '5분',
    walkInfo: null,
  },
  {
    order: 2,
    name: '대림창고 갤러리',
    category: '갤러리',
    desc: '성수동 대표 복합문화공간으로 전시와 카페를 함께 즐길 수 있습니다.',
    duration: '30분',
    walkInfo: '도보 8분 (0.5km)',
  },
  {
    order: 3,
    name: '카페 온도',
    category: '카페',
    desc: '감성적인 인테리어와 핸드드립 커피로 유명한 성수동 인기 카페입니다.',
    duration: '40분',
    walkInfo: '도보 5분 (0.3km)',
  },
  {
    order: 4,
    name: '서울숲',
    category: '공원',
    desc: '도심 속 자연을 만끽할 수 있는 대규모 공원으로 산책과 사진 촬영에 최적입니다.',
    duration: '40분',
    walkInfo: '도보 12분 (0.9km)',
  },
  {
    order: 5,
    name: '뚝섬 사진관',
    category: '사진',
    desc: '레트로 감성의 필름 사진관으로 여행의 마무리를 특별하게 남길 수 있습니다.',
    duration: '25분',
    walkInfo: '도보 10분 (0.7km)',
  },
]

// ─── Export: 메인 페이지 컴포넌트 ───
export default function AIPage() {
  const [step, setStep] = useState(1)
  const [station, setStation] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [totalMinutes, setTotalMinutes] = useState(150)
  const [includeMeal, setIncludeMeal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleThemeToggle = (label: string) => {
    setSelectedThemes((prev) =>
      prev.includes(label)
        ? prev.filter((t) => t !== label)
        : prev.length < 3
          ? [...prev, label]
          : prev,
    )
  }

  const handleAIRecommend = async () => {
    setIsLoading(true)
    // TODO: 실제 OpenAI API 연동 시 fetch('/api/ai-recommend', ...) 로 교체
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setStep(4)
  }

  const formatTime = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `약 ${h}시간 ${m}분` : `약 ${h}시간`
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <GlobalHeader />

      <PageContainer className="flex-1 py-8">
        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
            <p className="text-lg font-bold text-gray-900">
              AI가 최적의 코스를 찾고 있어요...
            </p>
            <p className="text-sm text-gray-500">
              선택하신 조건에 맞는 장소를 분석 중입니다
            </p>
          </div>
        )}

        {/* 스텝 인디케이터 (1~3) */}
        {step <= 3 && <AIStepIndicator currentStep={step} steps={STEPS} />}

        {/* ── Step 1: 출발지 선택 ── */}
        {step === 1 && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              어디서 출발하시나요?
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              가까운 지하철역을 검색해주세요
            </p>

            {/* 검색창 */}
            <div className="w-full max-w-md border border-gray-200 rounded-xl px-4 py-3.5 flex items-center gap-3 mb-8">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="지하철역 이름을 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* 인기 출발지 */}
            <div className="w-full max-w-md">
              <p className="text-sm font-semibold text-gray-500 mb-3">
                인기 출발지
              </p>
              <div className="divide-y divide-gray-100">
                {POPULAR_STATIONS.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => {
                      setStation(s.name)
                      setStep(2)
                    }}
                    className="w-full flex items-center justify-between py-4 hover:bg-gray-50 transition-colors cursor-pointer px-1"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {s.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{s.line}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={() => station && setStep(2)}
              disabled={!station}
              className={`w-full max-w-md mt-8 py-3.5 rounded-xl font-bold text-sm transition-all ${
                station
                  ? 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              다음
            </button>
          </div>
        )}

        {/* ── Step 2: 테마 선택 ── */}
        {step === 2 && (
          <div className="flex flex-col items-center">
            <AIFilterBadge className="mb-6">
              <MapPin className="w-3 h-3" /> 출발: {station}
            </AIFilterBadge>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              어떤 테마를 선호하시나요?
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              최대 3개까지 선택할 수 있어요
            </p>

            <div className="flex flex-wrap justify-center gap-3 max-w-lg mb-4">
              {THEME_TAGS.map((tag) => (
                <AITagButton
                  key={tag.label}
                  label={tag.label}
                  emoji={tag.emoji}
                  selected={selectedThemes.includes(tag.label)}
                  onClick={() => handleThemeToggle(tag.label)}
                />
              ))}
            </div>

            <p className="text-sm text-gray-400 mb-8">
              {selectedThemes.length}/3 선택됨
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> 이전
              </button>
              <button
                onClick={() => selectedThemes.length > 0 && setStep(3)}
                disabled={selectedThemes.length === 0}
                className={`flex items-center gap-1 px-5 py-2.5 rounded-full text-sm font-bold transition cursor-pointer ${
                  selectedThemes.length > 0
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                다음 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: 시간 설정 ── */}
        {step === 3 && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6">
              <AIFilterBadge>
                <MapPin className="w-3 h-3" /> 출발: {station}
              </AIFilterBadge>
              <AIFilterBadge>
                <Sparkles className="w-3 h-3" /> 테마:{' '}
                {selectedThemes.join(', ')}
              </AIFilterBadge>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              총 소요 시간은 어떻게 할까요?
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              도보 이동 시간을 포함한 전체 시간이에요
            </p>

            <AITimeSlider
              totalMinutes={totalMinutes}
              setTotalMinutes={setTotalMinutes}
              includeMeal={includeMeal}
              setIncludeMeal={setIncludeMeal}
            />

            <div className="flex items-center gap-3 w-full max-w-md mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> 이전
              </button>
              <button
                onClick={handleAIRecommend}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" /> AI 코스 추천받기 ✨
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: AI 추천 결과 ── */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> AI 추천 코스
            </h2>

            {/* 조건 요약 */}
            <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
              <p className="text-sm text-gray-700">
                <MapPin className="w-3.5 h-3.5 inline mr-1" /> 출발: {station}
              </p>
              <p className="text-sm text-gray-700">
                <Sparkles className="w-3.5 h-3.5 inline mr-1" /> 테마:{' '}
                {selectedThemes.join(', ')}
              </p>
              <p className="text-sm text-gray-700">
                <Clock className="w-3.5 h-3.5 inline mr-1" /> 총 소요 시간:{' '}
                {formatTime(totalMinutes)}
              </p>
            </div>

            {/* 결과 미리보기 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <Footprints className="w-4 h-4 text-gray-500 mb-1" />
                <p className="text-xs text-gray-400">총 도보 거리</p>
                <p className="text-sm font-bold text-gray-900">3.2km</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <Clock className="w-4 h-4 text-gray-500 mb-1" />
                <p className="text-xs text-gray-400">예상 소요 시간</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatTime(totalMinutes)}
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <MapPin className="w-4 h-4 text-gray-500 mb-1" />
                <p className="text-xs text-gray-400">주요 장소</p>
                <p className="text-sm font-bold text-gray-900">
                  {DUMMY_RESULTS.length}곳
                </p>
              </div>
            </div>

            {/* 추천 코스 리스트 */}
            <p className="text-sm font-bold text-gray-500 mb-3">
              추천 코스 리스트
            </p>
            <div className="space-y-0">
              {DUMMY_RESULTS.map((place) => (
                <AIResultCard key={place.order} {...place} />
              ))}
            </div>

            {/* 하단 버튼 */}
            <div className="flex items-center gap-3 mt-8">
              <button className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition cursor-pointer">
                📋 일정 저장하기
              </button>
              <button
                onClick={() => {
                  setStep(1)
                  setStation('')
                  setSelectedThemes([])
                  setTotalMinutes(150)
                }}
                className="py-3.5 px-5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer flex items-center gap-2"
              >
                🔄 다시 추천받기
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  )
}
