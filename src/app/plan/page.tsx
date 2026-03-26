"use client";

import CommonButton from "@/components/domain/plan/CommonButton";
import FilterBadge from "@/components/domain/plan/FilterBadge";
import ItineraryMap from "@/components/domain/plan/ItineraryMap";
import PlaceSearchModal from "@/components/domain/plan/PlaceSearchModal";
import TimelineList from "@/components/domain/plan/TimelineList";
import GlobalHeader from "@/components/layout/GlobalHeader";
import PageContainer from "@/components/layout/PageContainer";
import { Calendar, MapPin, MoreHorizontal, Share2, Sparkles } from "lucide-react";
import { useState } from "react";

// 글로벌 공통 장소 데이터 구조
export interface Place {
  id: string;      
  name: string;    
  category: string;
  address: string; 
  lat: number;     
  lng: number;     
}

export default function PlanPage() {
  const [places, setPlaces] = useState<Place[]>([
    { id: "1", name: "불국사", category: "관광", address: "경북 경주시 진현동 15", lat: 35.790104, lng: 129.332079 },
    { id: "2", name: "석굴암", category: "관광", address: "경북 경주시 불국로 873-243", lat: 35.794939, lng: 129.349141 },
  ]);
  
  // 모달창 on/off 상태 관리
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 모달창에서 장소를 선택했을 때 새 장소를 추가하는 함수
  const handleAddPlace = (lat: number, lng: number, name: string, category: string, address: string) => {
    const newPlace: Place = {
      id: Date.now().toString(), 
      name, 
      category, 
      address,
      lat,
      lng,
    };
    setPlaces((prev) => [...prev, newPlace]);
  };

  const handleReorderPlaces = (startIndex: number, endIndex: number) => {
    const newPlaces = Array.from(places); 
    const [removed] = newPlaces.splice(startIndex, 1); 
    newPlaces.splice(endIndex, 0, removed); 
    setPlaces(newPlaces); 
  };

  const handleDeletePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* 팝업 오버레이 조건부 렌더링 */}
      {isSearchOpen && (
        <PlaceSearchModal 
          onClose={() => setIsSearchOpen(false)} 
          onSelect={(lat, lng, name, category, addr) => {
            handleAddPlace(lat, lng, name, category, addr);
            setIsSearchOpen(false); // 완추가 후 모달 자동 닫기
          }} 
        />
      )}
      <GlobalHeader />

      <PageContainer className="flex-1 py-8">
        {/* 상단 헤더 영역 */}
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-start w-full mb-3">
            <div className="flex items-center gap-4">
              <h1 className="text-[22px] font-bold text-gray-900">여행 일정 플래너</h1>
              <div className="flex items-center gap-2">
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] flex items-center gap-1.5 rounded-full">
                  <Calendar className="w-3 h-3 text-gray-500" /> 6월 14일 (토)
                </FilterBadge>
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] flex items-center gap-1.5 rounded-full">
                  <MapPin className="w-3 h-3 text-gray-500" /> 경주
                </FilterBadge>
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] rounded-full">
                  Day 1
                </FilterBadge>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-400">
              <button className="p-1 hover:text-gray-900 transition-colors"><Share2 className="w-5 h-5" /></button>
              <button className="p-1 hover:text-gray-900 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
          </div>
          
          <div className="mb-2">
            <CommonButton className="!bg-gray-900 !text-white hover:!bg-gray-800 !rounded-lg px-4 py-2 flex items-center gap-2 text-xs border-none">
              <Sparkles className="w-3.5 h-3.5" /> AI 동선 최적화
            </CommonButton>
          </div>
        </div>

        {/* 본문 영역: 좌측 지도, 우측 타임라인 */}
        <div className="flex flex-col lg:flex-row w-full gap-8 h-[calc(100vh-240px)] min-h-[600px]">
          
          {/* 좌측 지도 패널: places 배열만을 넘기기 (클릭은 삭제) */}
          <div className="w-full lg:w-[55%] xl:w-[60%] h-[400px] lg:h-full relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
            <ItineraryMap places={places} />
          </div>

          {/* 우측 타임라인 패널: 검색 모달 onOpenSearch 함수 연결 */}
          <div className="w-full lg:w-[45%] xl:w-[40%] h-full flex flex-col relative pr-2">
            <TimelineList 
              places={places} 
              onReorder={handleReorderPlaces} 
              onDelete={handleDeletePlace} 
              onOpenSearch={() => setIsSearchOpen(true)}
            />
          </div>
          
        </div>
      </PageContainer>
    </div>
  );
}
