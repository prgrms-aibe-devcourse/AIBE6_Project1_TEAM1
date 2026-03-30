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

type PlaceMap = Record<number, string>

const getTransportIcon = (transport: string) => {
  switch (transport) {
    case 'walk':
      return '👟'
    case 'bus':
      return '🚍'
    case 'subway':
      return '🚇'
    case 'taxi':
      return '🚖'
    case 'transit':
      return '🚌'
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
  placeMap,
  options,
  onChange,
}: {
  routes: Route[]
  placeMap: PlaceMap
  options: RouteOption[]
  onChange: (data: RouteOption[]) => void
}) {
  // ✅ 옵션 업데이트: 내부 상태 없이 부모 onChange 사용
  const updateOption = (
    index: number,
    key: keyof RouteOption,
    value: string,
  ) => {
    const updated = [...options]
    updated[index] = { ...updated[index], [key]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-4 bg-white dark:bg-gray-900 rounded-lg p-4 border border-transparent dark:border-gray-800">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 dark:text-gray-100">
        <RouteIcon /> 경로별 보행 환경
      </h3>

      {routes.map((route, index) => {
        const fromName = placeMap[route.from] ?? route.from
        const toName = placeMap[route.to] ?? route.to
        const transport = route.transport
        const opt = options[index] || { slope: '', stairs: '', shade: '' }

        return (
          <div
            key={index}
            className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 py-2 text-center"
          >
            {/* 왼쪽: from → to */}
            <div className="flex flex-col items-center justify-center w-32 font-medium dark:text-gray-200">
              {fromName}
              <br /> → <br />
              {toName}
            </div>

            {/* 가운데: transport 아이콘 */}
            <div className="flex flex-col items-center justify-center w-20 text-2xl">
              {getTransportIcon(transport)}
            </div>

            {/* 오른쪽: walk만 옵션 */}
            {transport === 'walk' ? (
              <div className="flex items-center gap-4">
                {/* 경사도 */}
                <div className="flex items-center gap-2">
                  <div className="text-gray-700 dark:text-gray-400">{getSlopeIcon(opt.slope)}</div>
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

                {/* 계단 */}
                <div className="flex items-center gap-2">
                  <div className="text-gray-700 dark:text-gray-400">
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

                {/* 그늘 */}
                <div className="flex items-center gap-2">
                  <div className="text-gray-700 dark:text-gray-400">{getShadeIcon(opt.shade)}</div>
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
