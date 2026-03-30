import { Bus, Footprints, ChevronRight, TrainFront, Car } from "lucide-react";
import { type TransportType } from "@/utils/tripUtils";
import { useState } from "react";

interface TransitIndicatorProps {
  type: TransportType;
  duration: string;
  onClick?: () => void;
  onTypeChange?: (type: TransportType) => void;
}

export default function TransitIndicator({ type, duration, onClick, onTypeChange }: TransitIndicatorProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const transportOptions: { type: TransportType; icon: any; label: string }[] = [
    { type: 'walk', icon: Footprints, label: '도보' },
    { type: 'transit', icon: Bus, label: '대중교통' },
    { type: 'taxi', icon: Car, label: '택시' },
  ];

  const CurrentIcon = transportOptions.find(opt => opt.type === type)?.icon || Footprints;
  const currentLabel = transportOptions.find(opt => opt.type === type)?.label || '도보';

  return (
    <div className={`flex flex-col items-start ml-2.5 relative transition-all ${isMenuOpen ? 'z-[60]' : 'z-10'}`}>
      <div className="relative flex items-center z-50 -ml-1.5 my-1 bg-white">
        <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:border-purple-200 transition-all">
          {/* 타입 선택 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1 border-r border-gray-100 hover:bg-gray-50 rounded-l-full transition-colors group"
          >
            <CurrentIcon className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[11px] font-bold text-gray-700">{currentLabel}</span>
          </button>
          
          {/* 소요 시간 및 길찾기 버튼 */}
          <button
            onClick={onClick}
            title="상세 길찾기 (카카오맵으로 연결)"
            className="flex items-center gap-1 px-3 py-1 hover:bg-purple-50 rounded-r-full text-[11px] font-medium text-gray-500 hover:text-purple-600 transition-all group"
          >
            {duration}
            <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-purple-500 ml-0.5" />
          </button>
        </div>

        {/* 선택 메뉴 */}
        {isMenuOpen && (
          <div className="absolute top-8 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-1 flex flex-col min-w-[100px] animate-in fade-in zoom-in duration-200">
            {transportOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => {
                  onTypeChange?.(opt.type);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                  type === opt.type 
                    ? 'bg-purple-50 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <opt.icon className={`w-3.5 h-3.5 ${type === opt.type ? 'text-purple-600' : 'text-gray-400'}`} />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 메뉴 열렸을 때 외부 클릭 방어용 오버레이 */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
