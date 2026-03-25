import { Bus, Footprints, ChevronRight } from "lucide-react";

interface TransitIndicatorProps {
  type: "walk" | "bus" | "train";
  duration: string;
}

export default function TransitIndicator({ type, duration }: TransitIndicatorProps) {
  return (
    <div className="flex flex-col items-start ml-2.5">
      <div className="flex items-center z-10 -ml-1.5 my-1 bg-white">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
          {type === "walk" ? <Footprints className="w-3 h-3 text-gray-500" /> : <Bus className="w-3 h-3 text-gray-500" />}
          {type === "walk" ? "도보" : "버스"} {duration}
          <ChevronRight className="w-3 h-3 text-gray-400 ml-0.5" />
        </div>
      </div>
    </div>
  );
}
