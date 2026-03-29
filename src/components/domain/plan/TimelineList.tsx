'use client'

import { useEffect, useState } from 'react'
// @ts-ignore : Typescript 지원이 완벽하게 안 될 것을 방지하기 위해 드래그 앤 드롭 타입체킹 무시
import { type Place } from '@/utils/tripUtils'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd'
import { Clock, GripVertical, X } from 'lucide-react'
import CommonButton from '@/components/common/CommonButton'
import FilterBadge from './FilterBadge'
import TransitIndicator from './TransitIndicator'

import { type TransportType, calcTravelMinutes } from '@/utils/tripUtils'

// calcTravelMinutes(shared)를 래핑하여 화면 표시용 포맷 문자열 반환
const getEstimatedTransit = (p1: Place, p2: Place, type: TransportType = 'transit') => {
  const minutes = calcTravelMinutes(p1, p2, type)
  const duration = minutes >= 60
    ? `약 ${Math.floor(minutes / 60)}시간 ${minutes % 60}분`
    : `약 ${minutes}분`
  return { type, duration }
}

interface TimelineListProps {
  places: Place[]
  onReorder: (startIndex: number, endIndex: number) => void
  onDelete: (id: string) => void
  onOpenSearch: () => void
  onSelectPlace?: (pos: { lat: number; lng: number }) => void
  onUpdateTransport: (id: string, type: TransportType) => void
}

export default function TimelineList({
  places,
  onReorder,
  onDelete,
  onOpenSearch,
  onSelectPlace,
  onUpdateTransport,
}: TimelineListProps) {
  // 드래그 앤 드롭은 브라우저(Client) 환경에서만 작동하게끔 방어하는 Hydration 꼬임 방지 장치
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // 마우스로 집었던 카드를 다른 데 내려놓을 때 실행되는 콜백
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return // 엉뚱한데 놔버리면 무시
    // 부모에게 0번 인덱스 카드가 3번 인덱스로 갔어요! 라고 알려드림
    onReorder(result.source.index, result.destination.index)
  }

  // 서버사이드 렌더링 충돌 임시 방어 (깜빡 방지)
  if (!mounted)
    return (
      <div className="p-8 text-center text-gray-500">타임라인 로딩중...</div>
    )

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-y-auto">
      <div className="flex items-center justify-between mb-4 mt-1 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold text-gray-900">타임라인</h2>
          <span className="text-[12px] text-gray-500 font-medium">
            {places.length}개 장소
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
          <Clock className="w-3.5 h-3.5" /> 총 일정 조율 중
        </div>
      </div>

      <div className="flex flex-col relative w-full pt-1 pb-16">
        {/* 뒤에 깔리는 세로 실선 뼈대 */}
        <div className="absolute left-[13.5px] top-4 bottom-16 w-px bg-gray-200 z-0"></div>

        {/* --- 여기서부터 드래그 앤 드롭 문법 --- */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timeline-droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="w-full flex flex-col"
              >
                {places.map((place, index) => (
                  // Draggable 요소를 개별 카드로 래핑합니다. id는 고유해야 합니다.
                  <Draggable
                    key={place.id}
                    draggableId={place.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative flex flex-col mb-1.5 ${snapshot.isDragging ? 'opacity-90 shadow-2xl scale-[1.02] z-[100] transition-transform' : 'transition-transform'}`}
                        style={{ ...provided.draggableProps.style, zIndex: snapshot.isDragging ? 100 : places.length - index + 10 }}
                      >
                        {/* 한 줄 형태의 카드 Row */}
                        <div className="flex items-start">
                          {/* 검정색 동그란 번호 */}
                          <div className="flex-shrink-0 flex items-center justify-center w-[28px] h-[28px] bg-gray-900 text-white rounded-full text-[11px] font-bold z-10 mt-2 shadow-sm">
                            {index + 1}
                          </div>

                          {/* 카드 본체 */}
                          <div
                            onClick={() =>
                              onSelectPlace?.({
                                lat: place.lat,
                                lng: place.lng,
                              })
                            }
                            className="flex-1 ml-4 bg-white rounded-xl border border-gray-200 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] group hover:border-purple-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-gray-900 text-[14px] leading-none">
                                    {place.name}
                                  </h3>
                                  <FilterBadge className="!px-1.5 !py-0.5 !text-[10px] !bg-gray-100 !text-gray-600 !border-gray-100 !rounded-md leading-none h-fit">
                                    {place.category}
                                  </FilterBadge>
                                  {place.isNearStation && (
                                    <FilterBadge className="!px-1.5 !py-0.5 !text-[10px] !bg-purple-100 !text-purple-600 !border-purple-100 !rounded-md leading-none h-fit font-bold">
                                      역세권
                                    </FilterBadge>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mb-0.5">
                                  <span className="w-1 h-1 bg-gray-300 rounded-full inline-block"></span>
                                  {place.address}
                                </p>
                              </div>

                              {/* 카드의 우측에 붙은 그립버튼과 삭제버튼 */}
                              <div className="flex items-center text-gray-400 gap-0.5 mt-[-4px] mr-[-4px]">
                                {/* ❗ 반드시 button이 아닌 div로 처리하고 dragHandleProps 달아주기 */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-1.5 hover:bg-gray-50 rounded-md cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                {/* X 버튼 누르면 삭제 함수 실행 */}
                                <button
                                  onClick={() => onDelete(place.id)}
                                  className="p-1.5 hover:bg-gray-50 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 카드와 카드 사이를 이어주는 연결 표시 (마지막 아이템이 아닐 때만 렌더링) */}
                        <div className="h-10 flex flex-col justify-center">
                          {index < places.length - 1 && (
                            <div className="ml-1 relative z-10 w-full">
                                <TransitIndicator
                                  type={place.transportType || 'walk'}
                                  duration={getEstimatedTransit(
                                    place,
                                    places[index + 1],
                                    place.transportType || 'walk'
                                  ).duration}
                                  onTypeChange={(type: TransportType) => onUpdateTransport(place.id, type)}
                                  onClick={() => {
                                    const from = place
                                    const to = places[index + 1]
                                    const mode = place.transportType || 'walk'
                                    
                                    // 카카오맵 공식 URL 스킴 (apis.map.kakao.com/web/guide/#routeurl)
                                    // - 도보(walk): link/by/walk 스킴으로 100% 경로 탐색 보장
                                    // - 대중교통/택시: 경로가 없을 수 있으므로 모든 이동수단 탭이 열리는
                                    //   link/from/.../to 범용 URL로 열어 사용자가 직접 탭 전환 가능하게 처리
                                    let url = ''
                                    
                                    if (mode === 'walk') {
                                      // 도보 - 항상 경로 존재, 정확한 모드로 바로 연결
                                      url = `https://map.kakao.com/link/by/walk/${encodeURIComponent(from.name)},${from.lat},${from.lng}/${encodeURIComponent(to.name)},${to.lat},${to.lng}`
                                    } else {
                                      // 대중교통/택시 - 경로 없을 수 있음
                                      // → 자동차/대중교통/도보 탭이 모두 표시되는 범용 URL 사용
                                      // → 카카오맵 내에서 탭 전환으로 원하는 수단 선택 가능
                                      url = `https://map.kakao.com/link/from/${encodeURIComponent(from.name)},${from.lat},${from.lng}/to/${encodeURIComponent(to.name)},${to.lat},${to.lng}`
                                    }
                                    
                                    window.open(url, '_blank')
                                  }}
                                />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* 맨 마지막에 위치한 '장소 추가' 버튼 - 클릭 시 검색 모달 오픈 */}
        <div className="mt-2 ml-11 mb-8">
          <CommonButton
            onClick={onOpenSearch}
            variant="outline"
            className="w-full !rounded-xl !py-3 !text-[13px] font-semibold flex justify-center !border-purple-200 !text-purple-600 bg-purple-50 hover:bg-purple-100 shadow-sm transition-colors cursor-pointer"
          >
            + 장소 추가하기
          </CommonButton>
        </div>
      </div>
    </div>
  )
}
