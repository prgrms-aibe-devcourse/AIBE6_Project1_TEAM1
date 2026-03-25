"use client";

import TransitIndicator from "./TransitIndicator";
import FilterBadge from "./FilterBadge";
import CommonButton from "./CommonButton";
import { GripVertical, X, Clock, Plus } from "lucide-react";

interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  time?: string;
}

export default function TimelineList() {
  const places: Place[] = [
    { id: "1", name: "불국사", category: "관광", address: "경주시 진현동", time: "09:00 - 10:30 (1시간 30분)" },
    { id: "2", name: "석굴암", category: "관광", address: "경주시 불국로", time: "10:45 - 12:00 (1시간 15분)" },
    { id: "3", name: "교리김밥", category: "맛집", address: "경주시 교동", time: "12:05 - 13:00 (55분)" },
    { id: "4", name: "동궁과 월지", category: "관광", address: "경주시 인왕동", time: "13:30 - 15:00 (1시간 30분)" },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-transparent overflow-y-auto">
      <div className="flex items-center justify-between mb-4 mt-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-bold text-gray-900">타임라인</h2>
          <span className="text-[12px] text-gray-500 font-medium">{places.length + 1}개 장소</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium">
          <Clock className="w-3.5 h-3.5" /> 총 6시간 30분
        </div>
      </div>
      
      <div className="flex flex-col relative w-full pt-1">
        {/* Continuous line connecting the timeline digits */}
        <div className="absolute left-[13.5px] top-4 bottom-16 w-px bg-gray-200 z-0"></div>

        {places.map((place, index) => (
          <div key={place.id} className="relative z-10 flex flex-col mb-1.5">
            {/* Place Card Row */}
            <div className="flex items-start">
              {/* Number Circle Bubble */}
              <div className="flex-shrink-0 flex items-center justify-center w-[28px] h-[28px] bg-gray-900 text-white rounded-full text-[11px] font-bold z-10 mt-2 shadow-sm">
                {index + 1}
              </div>
              
              {/* Card Main Area */}
              <div className="flex-1 ml-4 bg-white rounded-xl border border-gray-200 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] group hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-[14px] leading-none">{place.name}</h3>
                      <FilterBadge className="!px-1.5 !py-0.5 !text-[10px] !bg-gray-100 !text-gray-600 !border-gray-100 !rounded-md leading-none h-fit">
                        {place.category}
                      </FilterBadge>
                    </div>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mb-0.5">
                      <span className="w-1 h-1 bg-gray-300 rounded-full inline-block"></span>
                      {place.address}
                    </p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {place.time}
                    </p>
                  </div>
                  
                  {/* Card Actions (Drag + Delete) */}
                  <div className="flex items-center text-gray-400 gap-0.5 mt-[-4px] mr-[-4px]">
                    <button className="p-1.5 hover:bg-gray-50 rounded-md cursor-grab"><GripVertical className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-gray-50 rounded-md"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Connecting bus/walk badge row */}
            <div className="h-10 flex flex-col justify-center">
              {index < places.length && (
                <div className="ml-1 relative z-10 w-full">
                  <TransitIndicator 
                    type={index === 1 ? "walk" : "bus"} 
                    duration={index === 1 ? "5분" : index === 0 ? "15분" : "20분"} 
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Partial 5th Place (Greyed out or placeholder style like wireframe) */}
        <div className="relative z-10 flex items-start opacity-50 mb-4">
          <div className="flex-shrink-0 flex items-center justify-center w-[28px] h-[28px] bg-gray-900 text-white rounded-full text-[11px] font-bold z-10 mt-2">
            5
          </div>
          <div className="flex-1 ml-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm h-[72px] overflow-hidden">
            <div className="w-1/3 h-4 bg-gray-100 rounded mb-2"></div>
            <div className="w-1/4 h-3 bg-gray-100 rounded"></div>
          </div>
        </div>
        
        {/* + 장소 추가 버튼 */}
        <div className="mt-2 ml-11 mb-8">
          <CommonButton variant="outline" className="w-full !rounded-xl !py-3 !text-[13px] font-semibold flex justify-center !border-gray-200 !text-gray-600 bg-white shadow-sm hover:!bg-gray-50">
            <Plus className="w-4 h-4 mr-1.5" /> 장소 추가
          </CommonButton>
        </div>
        
      </div>
    </div>
  );
}
