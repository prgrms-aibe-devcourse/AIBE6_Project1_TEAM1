import {
  ArrowRight,
  ArrowUpNarrowWide,
  Minus,
  Mountain,
  RouteIcon,
  TreeDeciduous,
  TreePine,
  Trees,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import CustomListbox from './CustomListBox'

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

const getTransportIcon = (transport: string) => {
  switch (transport) {
    case 'walk':
      return '👟'
    case 'bus':
      return '🚌'
    case 'subway':
      return '🚇'
    default:
      return '❓'
  }
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
        const transport = route.transport
        const opt = options[index] || {}

        // // 옵션 텍스트, 선택 없으면 '-' 표시
        // const slopeText = opt.slope || '-'
        // const stairsText = opt.stairs || '-'
        // const shadeText = opt.shade || '-'

        return (
          <div
            key={index}
            className="flex items-center justify-between border-b py-2 text-center"
          >
            {/* 왼쪽: from → to */}
            <div className="flex flex-col items-center justify-center w-32 font-medium">
              {fromName}
              <br /> → <br />
              {toName}
            </div>
            <div className="flex flex-col items-center justify-center w-20 text-2xl">
              {getTransportIcon(transport)}
            </div>
            {/* ✅ 2. 오른쪽 영역: select 대신 CustomListbox 사용 */}
            {route.transport === 'walk' ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-gray-700">{getSlopeIcon(opt.slope)}</div>
                  <CustomListbox
                    value={opt.slope}
                    placeholder="경사도"
                    onChange={(val) => updateOption(index, 'slope', val)}
                    options={[
                      { name: '평지', value: '평지' },
                      { name: '보통', value: '보통' },
                      { name: '가파름', value: '가파름' },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-gray-700">
                    {getStairsIcon(opt.stairs)}
                  </div>
                  <CustomListbox
                    value={opt.stairs}
                    placeholder="계단"
                    onChange={(val) => updateOption(index, 'stairs', val)}
                    options={[
                      { name: '계단 없음', value: '없음' },
                      { name: '계단 있음', value: '있음' },
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-gray-700">{getShadeIcon(opt.shade)}</div>
                  <CustomListbox
                    value={opt.shade}
                    placeholder="그늘"
                    onChange={(val) => updateOption(index, 'shade', val)}
                    options={[
                      { name: '그늘 적음', value: '적음' },
                      { name: '그늘 보통', value: '보통' },
                      { name: '그늘 많음', value: '많음' },
                    ]}
                  />
                </div>
              </div>
            ) : (
              <div className="w-[360px]" />
            )}
          </div>
        )
      })}
    </div>
  )
}
