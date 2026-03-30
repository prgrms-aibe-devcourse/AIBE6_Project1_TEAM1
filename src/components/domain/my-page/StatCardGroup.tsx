interface StatCardGroupProps {
  triplogCount: number;
  totalDistance: number;
  reviewCount: number;
}

export default function StatCardGroup({ triplogCount, totalDistance, reviewCount }: StatCardGroupProps) {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-50 dark:border-gray-800 p-6 flex flex-row items-center justify-between mx-auto w-full max-w-2xl">
      <div className="flex flex-col items-center flex-1 border-r border-gray-100 dark:border-gray-800 last:border-0 relative">
        <span className="text-[13px] font-medium text-gray-400 mb-1">여행 횟수</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold text-gray-900 dark:text-gray-100">{triplogCount}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">회</span>
        </div>
      </div>
      <div className="flex flex-col items-center flex-1 border-r border-gray-100 dark:border-gray-800 last:border-0 relative">
        <span className="text-[13px] font-medium text-gray-400 mb-1">총 거리</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold text-gray-900 dark:text-gray-100">{totalDistance}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">km</span>
        </div>
      </div>
      <div className="flex flex-col items-center flex-1 relative">
        <span className="text-[13px] font-medium text-gray-400 mb-1">리뷰</span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-[22px] font-bold text-gray-900 dark:text-gray-100">{reviewCount}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">개</span>
        </div>
      </div>
    </section>
  );
}
