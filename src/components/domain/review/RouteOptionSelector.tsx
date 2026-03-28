import {
  ArrowRight,
  ArrowUpNarrowWide,
  Minus,
  Mountain,
  Route,
  RouteIcon,
  TreeDeciduous,
  TreePine,
  Trees,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'

type Route = {
  from: number
  to: number
  transport: string
}

type RouteOption = {
  slope: string
  stairs: string
  shade: string
}

type Place = {
  id: number
  place_name: string
}

const getSlopeIcon = (value: string) => {
  switch (value) {
    case '평지':
      return <ArrowRight />
    case '보통':
      return <TrendingUp />
    case '가파름':
      return <Mountain />
    default:
      return <TrendingUp className="text-gray-300" />
  }
}

const getStairsIcon = (value: string) => {
  switch (value) {
    case '없음':
      return <Minus />
    case '있음':
      return <ArrowUpNarrowWide />
    default:
      return <ArrowUpNarrowWide className="text-gray-300" />
  }
}

const getShadeIcon = (value: string) => {
  switch (value) {
    case '적음':
      return <TreePine />
    case '보통':
      return <TreeDeciduous />
    case '많음':
      return <Trees />
    default:
      return <TreeDeciduous className="text-gray-300" />
  }
}

export default function RouteOptionSelector({
  routes,
  supabase,
  onChange,
}: {
  routes: Route[]
  supabase: any
  onChange: (data: RouteOption[]) => void
}) {
  const [placeMap, setPlaceMap] = useState<Record<number, string>>({})
  const [options, setOptions] = useState<RouteOption[]>([])

  // ✅ routes 변경 시 options 초기화
  useEffect(() => {
    setOptions(
      routes.map(() => ({
        slope: '',
        stairs: '',
        shade: '',
      })),
    )
  }, [routes])

  // ✅ options 변경 시 부모로 전달
  useEffect(() => {
    onChange(options)
  }, [options])

  // ✅ place_id → place_name 변환
  useEffect(() => {
    const fetchPlaces = async () => {
      const ids = Array.from(new Set(routes.flatMap((r) => [r.from, r.to])))

      const { data, error } = await supabase
        .from('places')
        .select('id, place_name')
        .in('id', ids)

      if (error) {
        console.error(error)
        return
      }

      const map: Record<number, string> = {}
      data?.forEach((item: Place) => {
        map[item.id] = item.place_name
      })

      setPlaceMap(map)
    }

    if (routes.length > 0) fetchPlaces()
  }, [routes])

  // ✅ 옵션 업데이트 함수
  const updateOption = (
    index: number,
    key: keyof RouteOption,
    value: string,
  ) => {
    setOptions((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [key]: value,
      }
      return updated
    })
  }

  return (
    <div className="space-y-4 bg-white rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <RouteIcon /> 경로별 보행 환경
      </h3>

      {routes.map((route, index) => {
        const fromName = placeMap[route.from] ?? route.from
        const toName = placeMap[route.to] ?? route.to

        const opt = options[index] || {}

        // 옵션 텍스트, 선택 없으면 '-' 표시
        const slopeText = opt.slope || '-'
        const stairsText = opt.stairs || '-'
        const shadeText = opt.shade || '-'

        return (
          <div
            key={index}
            className="flex items-center justify-between border-b py-2"
          >
            {/* 왼쪽: from → to */}
            <div className="font-medium">
              {fromName} → {toName}
            </div>

            {/* 오른쪽: 옵션 or walk 아닌 경우 빈 공간 */}
            {route.transport === 'walk' ? (
              <div className="flex items-center gap-6 text-gray-700">
                {/* 경사도 */}
                {getSlopeIcon(opt.slope)}
                <select
                  value={opt.slope || ''}
                  onChange={(e) => updateOption(index, 'slope', e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">경사도</option>
                  <option value="평지">평지</option>
                  <option value="보통">보통</option>
                  <option value="가파름">가파름</option>
                </select>

                {/* 계단 */}
                {getStairsIcon(opt.stairs)}
                <select
                  value={opt.stairs || ''}
                  onChange={(e) =>
                    updateOption(index, 'stairs', e.target.value)
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="">계단</option>
                  <option value="없음">계단 없음</option>
                  <option value="있음">계단 있음</option>
                </select>

                {/* 그늘 */}
                {getShadeIcon(opt.shade)}
                <select
                  value={opt.shade || ''}
                  onChange={(e) => updateOption(index, 'shade', e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="">그늘</option>
                  <option value="적음">그늘 적음</option>
                  <option value="보통">그늘 보통</option>
                  <option value="많음">그늘 많음</option>
                </select>
              </div>
            ) : (
              <div className="text-gray-300 w-[220px] text-right">
                {/* walk 아닐 때는 옵션 없이 빈 공간 유지 */}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
