'use client'

import { Bookmark, Clock, CreditCard, Flame, MapPin, Route, Star } from 'lucide-react';
import Image from 'next/image';

export interface TravelCardProps {
  // 1. 기본 식별 정보
  id: string;
  title: string;          // 예: "영도 흰여울문화마을 산책 코스"
  imageUrl: string;
  category: string;       // 예: "해안 산책"
  isHot: boolean;         // '인기 코스' 배지 여부

  // 2. 주요 요약 정보 (이미지의 상단 5개 아이콘 영역)
  summary: {
    totalDistance: number;  // 3.2km
    totalTime: string;      // "약 2시간"
    spotCount: number;      // 5곳
    estimatedCost: number;  // 2,400원 (총 이동 비용)
    saveCount: number;      // 1,024 (저장 수)
  };

  // 3. 보행 환경 평균 데이터 (이미지 좌측 하단)
  avgStats: {
    incline: '평지' | '완만' | '보통' | '급경사';
    stairs: '없음' | '적음' | '다소 많음' | '매우 많음';
    shade: '없음' | '적음' | '보통' | '충분함';
  };

  // 4. 리뷰 요약
  rating?: number;         // 4.2
  reviewCount?: number;    // 128개

  // 5. 추가 정보
  tags?: string[];        // 예: ["가족여행", "힐링", "바다"]

  // 6. UI 제어
  variant?: 'vertical' | 'horizontal';
  isKept: boolean;
  onKeep?: (id: string) => void;
  onClick?: () => void;
}

export default function TravelCard({
  id,
  title,
  imageUrl,
  category,
  isHot,
  summary,
  avgStats,
  rating,
  reviewCount,
  tags,
  variant = 'vertical',
  isKept,
  onKeep,
  onClick,
}: TravelCardProps) {
  const isHorizontal = variant === 'horizontal'

  const handleKeepClick = (e: React.MouseEvent) => {
    if (onKeep) {
      e.stopPropagation()
      onKeep(id)
    }
  }

  // 내부 UI 컴포넌트: 요약 정보 아이템
  const SummaryItem = ({ icon: Icon, value }: { icon: any; value: string | number }) => (
    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
      <Icon className="h-3.5 w-3.5" />
      <span>{value}</span>
    </div>
  )

  // 내부 UI 컴포넌트: 보행 환경 통계 배지
  const StatBadge = ({ label }: { label: string }) => (
    <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-md">
      {label}
    </span>
  )

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-200 hover:shadow-lg active:scale-[0.98] active:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${isHorizontal ? 'flex h-48 w-full' : 'flex flex-col'}`}
    >
      {/* 1. 이미지 및 오버레이 레이어 */}
      <div
        className={`relative overflow-hidden ${
          isHorizontal ? 'h-full w-2/5 min-w-[160px]' : 'aspect-[4/3] w-full'
        }`}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* 그라데이션 오버레이 (텍스트 가독성) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* 좌측 상단: 카테고리 태그 및 인기 배지 */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 dark:bg-gray-800/80 px-2.5 py-1 text-[11px] font-bold text-gray-900 dark:text-gray-200 shadow-sm backdrop-blur-sm">
            {category}
          </span>
          {isHot && (
            <span className="flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <Flame className="h-3 w-3 fill-white" />
              HOT 코스
            </span>
          )}
        </div>

        {/* 우측 상단: 보관 버튼 */}
        {onKeep && (
          <button
            onClick={handleKeepClick}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80 p-1.5 text-gray-700 dark:text-gray-300 shadow-sm backdrop-blur-md transition-all hover:bg-white dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <Bookmark
              className={`h-full w-full transition-colors ${isKept ? 'fill-purple-600 text-purple-600' : ''}`}
            />
          </button>
        )}

        {/* 좌측 하단: 보행 환경 평균 데이터 */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <StatBadge label={avgStats.incline} />
          <StatBadge label={`계단 ${avgStats.stairs}`} />
          <StatBadge label={`그늘 ${avgStats.shade}`} />
        </div>
      </div>

      {/* 2. 컨텐츠 영역 */}
      <div className={`flex flex-1 flex-col justify-between p-4 ${isHorizontal ? 'overflow-hidden' : ''}`}>
        <div className="space-y-2">
          {/* 제목 및 별점 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
              {title}
            </h3>
            {rating !== undefined && reviewCount !== undefined && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{rating}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">({reviewCount})</span>
              </div>
            )}
          </div>

          {/* 주요 요약 정보 (5개 아이콘) */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
            <SummaryItem icon={Route} value={`${summary.totalDistance}km`} />
            <SummaryItem icon={Clock} value={summary.totalTime} />
            <SummaryItem icon={MapPin} value={`${summary.spotCount}곳`} />
            <SummaryItem icon={CreditCard} value={`${summary.estimatedCost.toLocaleString()}원`} />
            <SummaryItem icon={Bookmark} value={summary.saveCount} />
          </div>

          {/* 태그 목록 */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] text-gray-400 dark:text-gray-500 before:content-['#'] hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
