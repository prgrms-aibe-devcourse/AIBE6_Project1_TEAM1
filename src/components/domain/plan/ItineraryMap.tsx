import { Plus, Minus, LocateFixed } from "lucide-react";

export default function ItineraryMap() {
  return (
    <div className="w-full h-full bg-[#f4f4f5] relative flex items-center justify-center">
      {/* 줌 컨트롤 (우측 상단) */}
      <div className="absolute top-4 right-4 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden z-20">
        <button className="p-2 hover:bg-gray-50 border-b border-gray-200 transition-colors">
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-50 transition-colors">
          <Minus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* 현재 위치 (좌측 하단) */}
      <div className="absolute bottom-4 left-4 z-20">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-600 rounded-md border border-gray-200 shadow-sm transition-colors">
          <LocateFixed className="w-3 h-3" /> 현재 위치
        </button>
      </div>

      {/* Placeholder Text */}
      <div className="font-bold text-gray-600 z-10 text-sm">Map View</div>

      {/* 와이어프레임과 유사하게 배치된 더미 핀들 */}
      <div className="absolute top-[30%] left-[20%] w-6 h-6 bg-gray-900 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">1</div>
      <div className="absolute top-[45%] left-[45%] w-6 h-6 bg-gray-900 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">2</div>
      <div className="absolute top-[50%] left-[65%] w-6 h-6 bg-[#27272a] rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">3</div>
      <div className="absolute top-[35%] left-[80%] w-6 h-6 bg-[#27272a] rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">4</div>
      <div className="absolute top-[65%] left-[30%] w-6 h-6 bg-[#27272a] rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">5</div>
    </div>
  );
}
