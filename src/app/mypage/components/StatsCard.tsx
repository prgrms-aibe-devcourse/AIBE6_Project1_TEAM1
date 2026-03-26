export default function StatsCard() {
  return (
    <section className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50 p-6 flex flex-row items-center justify-between mx-auto w-full max-w-2xl">
      <div className="flex flex-col items-center flex-1 border-r border-gray-100 last:border-0 relative">
        <span className="text-[13px] font-medium text-gray-400 mb-1">여행 횟수</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold text-gray-900">12</span>
          <span className="text-sm font-bold text-gray-900">회</span>
        </div>
      </div>
      <div className="flex flex-col items-center flex-1 border-r border-gray-100 last:border-0 relative">
        <span className="text-[13px] font-medium text-gray-400 mb-1">총 거리</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold text-gray-900">234</span>
          <span className="text-sm font-bold text-gray-900">km</span>
        </div>
      </div>
      <div className="flex flex-col items-center flex-1 relative">
        <span className="text-[13px] font-medium text-gray-400 mb-1">리뷰</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold text-gray-900">8</span>
          <span className="text-sm font-bold text-gray-900">개</span>
        </div>
      </div>
    </section>
  );
}
