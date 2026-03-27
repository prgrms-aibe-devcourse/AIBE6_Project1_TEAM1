import { Bus, Footprints, ChevronRight } from "lucide-react";

interface TransitIndicatorProps {
  type: "walk" | "bus" | "train";
  duration: string;
  onClick?: () => void;
}

export default function TransitIndicator({ type, duration, onClick }: TransitIndicatorProps) {
  return (
    <div className="flex flex-col items-start ml-2.5">
      <div className="flex items-center z-10 -ml-1.5 my-1 bg-white">
        <div
          onClick={onClick}
          title="상세 길찾기 (카카오맵으로 연결)"
          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 shadow-sm cursor-pointer hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all active:scale-95 group"
        >
          {type === "walk" ? (
            <Footprints className="w-3 h-3 text-gray-500 group-hover:text-purple-500" />
          ) : (
            <Bus className="w-3 h-3 text-gray-500 group-hover:text-purple-500" />
          )}
          {type === "walk" ? "도보" : "버스"} {duration}
          <ChevronRight className="w-3 h-3 text-gray-400 ml-0.5 group-hover:text-purple-500" />
        </div>
      </div>
    </div>
  );
}
