"use client";

import { useState } from "react";
import { X, Search, MapPin } from "lucide-react";

interface PlaceSearchResult {
  id: string;
  place_name: string;
  category_group_name: string;
  address_name: string;
  y: string; // 위도(lat) string
  x: string; // 경도(lng) string
}

interface PlaceSearchModalProps {
  onClose: () => void;
  // 선택했을 때 부모(PlanPage)로 보낼 데이터 구조
  onSelect: (lat: number, lng: number, name: string, category: string, address: string) => void;
}

export default function PlaceSearchModal({ onClose, onSelect }: PlaceSearchModalProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);

  // 카카오 장소 검색 로직
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    
    // API 검증
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      alert("카카오 장소 검색 API가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    
    // 키워드로 장소 검색
    ps.keywordSearch(keyword, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        setResults([]);
        alert("관련된 장소를 찾을 수 없습니다.");
      } else {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    // 화면 전체를 덮는 투명한 검은색 팝업 배경
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* 팝업 모달창 본체 */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col h-[80vh] overflow-hidden">
        
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-700" /> 장소 검색 및 추가
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 검색 인풋 영역 */}
        <div className="p-5 bg-gray-50 border-b border-gray-100">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="가고 싶은 식당이나 명소를 검색해보세요! (예: 경주 황리단길)" 
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-[15px] shadow-sm"
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button type="submit" className="hidden">검색</button> {/* 엔터키 용 */}
          </form>
        </div>

        {/* 결과 리스트 영역 */}
        <div className="flex-1 overflow-y-auto p-3 bg-white">
          {results.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-300">
               <Search className="w-10 h-10 mb-3 opacity-20" />
               <p className="text-[15px] font-medium">검색어에 해당하는 장소가 여기에 나타납니다.</p>
             </div>
          ) : (
             <div className="flex flex-col gap-2">
               {results.map((place) => (
                 <div 
                   key={place.id}
                   // 클릭 시 부모(PlanPage)로 장소 정보를 통째로 쏴줌
                   onClick={() => onSelect(
                     parseFloat(place.y), 
                     parseFloat(place.x), 
                     place.place_name, 
                     place.category_group_name.split(' > ').pop() || '기타', // 가장 마지막 카테고리만 깔끔하게 빼냄 (ex: 한식)
                     place.address_name
                   )}
                   className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-200 transition-all group"
                 >
                   <div className="flex flex-col gap-1.5 overflow-hidden pr-4">
                     <h4 className="font-bold text-gray-900 text-[15px] truncate">{place.place_name}</h4>
                     <p className="text-[12px] text-gray-500 truncate">{place.address_name}</p>
                   </div>
                   {/* 마우스를 올렸을 때만 나타나는 추가하기 뱃지 버턴 효과 */}
                   <div className="flex-shrink-0 bg-gray-900 text-white px-3.5 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                     추가하기
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
