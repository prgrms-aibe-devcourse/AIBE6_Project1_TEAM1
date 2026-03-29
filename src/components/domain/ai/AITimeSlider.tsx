'use client'

interface AITimeSliderProps {
  totalMinutes: number
  setTotalMinutes: (min: number) => void
  includeMeal: boolean
  setIncludeMeal: (val: boolean) => void
}

const QUICK_TIMES = [
  { label: '4시간', min: 240 },
  { label: '6시간 (반나절)', min: 360 },
  { label: '8시간', min: 480 },
  { label: '하루 (저녁포함)', min: 720 },
]

export default function AITimeSlider({
  totalMinutes,
  setTotalMinutes,
  includeMeal,
  setIncludeMeal,
}: AITimeSliderProps) {
  const formatTime = (min: number) => {
    if (min >= 720) return '하루 (약 12시간)'
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `약 ${h}시간 ${m}분` : `약 ${h}시간`
  }

  return (
    <div className="w-full max-w-md border border-gray-200 rounded-xl p-6 bg-white">
      <p className="text-center text-3xl font-extrabold text-gray-900 mb-6">
        {formatTime(totalMinutes)}
      </p>

      <input
        type="range"
        min={240}
        max={720}
        step={60}
        value={totalMinutes}
        onChange={(e) => setTotalMinutes(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900 mb-2"
      />
      <div className="flex justify-between text-xs text-gray-400 mb-6">
        <span>4시간</span>
        <span>6시간</span>
        <span>8시간</span>
        <span>10시간</span>
        <span>하루</span>
      </div>

      <p className="text-center text-xs font-semibold text-gray-500 mb-3">
        빠른 선택
      </p>
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {QUICK_TIMES.map((t) => (
          <button
            key={t.label}
            onClick={() => setTotalMinutes(t.min)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer border ${
              totalMinutes === t.min
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            🍽️ 식사 시간 포함
          </p>
          <p className="text-xs text-gray-400">
            맛집 방문 시 식사 시간(약 1시간)을 추가합니다
          </p>
        </div>
        <button
          onClick={() => setIncludeMeal(!includeMeal)}
          className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
            includeMeal ? 'bg-gray-900' : 'bg-gray-200'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
              includeMeal ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
