'use client'

// ─── Import: React ───
import { useEffect, useState } from 'react'

// ─── Import: AI API 타입 ───
import type { AIPlace, AIRecommendResponse } from '@/app/api/ai-recommend/route'

// ─── Import: Layout 컴포넌트 ───
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
  Wallet,
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
    transitFare: null,
  },
  {
    order: 2,
    name: '대림창고 갤러리',
    category: '갤러리',
    desc: '성수동 대표 복합문화공간으로 전시와 카페를 함께 즐길 수 있습니다.',
    duration: '30분',
    walkInfo: '도보 8분 (0.5km)',
    transitFare: 0,
  },
  {
    order: 3,
    name: '카페 온도',
    category: '카페',
    desc: '감성적인 인테리어와 핸드드립 커피로 유명한 성수동 인기 카페입니다.',
    duration: '40분',
    walkInfo: '도보 5분 (0.3km)',
    transitFare: 0,
  },
  {
    order: 4,
    name: '서울숲',
    category: '공원',
    desc: '도심 속 자연을 만끽할 수 있는 대규모 공원으로 산책과 사진 촬영에 최적입니다.',
    duration: '40분',
    walkInfo: '도보 12분 (0.9km)',
    transitFare: 0,
  },
  {
    order: 5,
    name: '뚝섬 사진관',
    category: '사진',
    desc: '레트로 감성의 필름 사진관으로 여행의 마무리를 특별하게 남길 수 있습니다.',
    duration: '25분',
    walkInfo: '도보 10분 (0.7km)',
    transitFare: 0,
  },
]

// ─── Export: 메인 페이지 컴포넌트 ───
export default function AIPage() {
  const [step, setStep] = useState(1)
  const [station, setStation] = useState('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [totalMinutes, setTotalMinutes] = useState(240)
  const [includeMeal, setIncludeMeal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiResult, setAiResult] = useState<AIRecommendResponse | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<
    { place_name: string; address_name: string }[]
  >([])
  const [showDropdown, setShowDropdown] = useState(false)

  // ─── 출발지 검색 debounce ───
  useEffect(() => {
    if (searchKeyword.length < 1) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places?query=${encodeURIComponent(searchKeyword)}&size=15`,
        )
        const data = await res.json()
        setSearchResults((data.documents ?? []).slice(0, 5))
        setShowDropdown(true)
      } catch {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchKeyword])

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
    setAiError(null)
    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station,
          themes: selectedThemes,
          totalMinutes,
          includeMeal,
        }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error ?? 'API 오류: ' + res.status)
      }
      const data: AIRecommendResponse = await res.json()
      setAiResult(data)
      setStep(4)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'AI 추천 중 오류가 발생했습니다.'
      setAiError(msg)
      setStep(4)
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (min: number) => {
    if (min >= 720) return '하루 (약 12시간)'
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `약 ${h}시간 ${m}분` : `약 ${h}시간`
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">

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
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">
              어디서 출발하시나요?
            </h2>

            {/* 검색창 */}
            <div className="relative w-full max-w-md mb-8">
              <div className="border border-gray-200 rounded-xl px-4 py-3.5 flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="출발지를 검색해주세요"
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value)
                    setStation('')
                  }}
                  onFocus={() =>
                    searchResults.length > 0 && setShowDropdown(true)
                  }
                  className="flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400"
                />
                {searchKeyword && (
                  <button
                    onClick={() => {
                      setSearchKeyword('')
                      setStation('')
                      setSearchResults([])
                      setShowDropdown(false)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 검색 자동완성 드롭다운 */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {searchResults.map((place, idx) => (
                    <button
                      key={`${place.place_name}-${idx}`}
                      onClick={() => {
                        setStation(place.place_name)
                        setSearchKeyword(place.place_name)
                        setShowDropdown(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {place.place_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {place.address_name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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

            {/* API 에러 표시 */}
            {aiError && (
              <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 mb-4 text-sm">
                {aiError}
              </div>
            )}

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

            {/* 결과 요약 통계 */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <Footprints className="w-4 h-4 text-gray-500 mb-1" />
                <p className="text-xs text-gray-400">총 도보 거리</p>
                <p className="text-sm font-bold text-gray-900">
                  {aiResult?.totalWalkDistance ?? '...'}
                </p>
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
                  {aiResult?.totalPlaces ?? DUMMY_RESULTS.length}곳
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-white">
                <Wallet className="w-4 h-4 text-gray-500 mb-1" />
                <p className="text-xs text-gray-400">교통비</p>
                <p className="text-sm font-bold text-gray-900">
                  {aiResult?.totalTransitFare != null
                    ? `${aiResult.totalTransitFare.toLocaleString()}원`
                    : '...'}
                </p>
              </div>
            </div>

            {/* 추천 코스 리스트 */}
            <p className="text-sm font-bold text-gray-500 mb-3">
              추천 코스 리스트
            </p>
            <div className="space-y-0">
              {(aiResult?.course ?? DUMMY_RESULTS).map((place: AIPlace) => (
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
                  setTotalMinutes(240)
                  setAiResult(null)
                  setAiError(null)
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
