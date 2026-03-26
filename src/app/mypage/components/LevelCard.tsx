import { Bookmark } from "lucide-react";

export default function LevelCard() {
  return (
    <section className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 p-6 relative overflow-hidden mt-6 mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-8">
        <Bookmark className="w-[18px] h-[18px] text-gray-900" strokeWidth={2} />
        <span className="text-[15px] font-bold text-gray-900">뚜벅 레벨</span>
      </div>
      
      <div className="flex items-end justify-between mb-2">
        <span className="text-[13px] font-semibold text-gray-900">Lv.3 뚜벅 탐험가</span>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-medium text-gray-400">다음 레벨까지</span>
          <span className="text-[11px] font-bold text-gray-500">60%</span>
        </div>
      </div>
      
      <div className="w-full h-[6px] bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gray-900 rounded-full w-[40%]" />
      </div>
    </section>
  );
}
