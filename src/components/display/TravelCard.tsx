"use client"; 

import { MapPin, Star, Bookmark } from "lucide-react";
import Image from "next/image";

export interface TravelCardProps {
  /** 카드 메인 제목 */
  title: string;
  /** 대표 이미지 URL */
  imageUrl?: string;
  /** 이미지 대체 텍스트 */
  imageAlt?: string;
  /** 간단한 설명이나 부제목 */
  description?: string;
  /** 작성자 정보 */
  author?: {
    name: string;
    avatarUrl?: string;
  };
  /** 별점 (예: 4.5) */
  rating?: number;
  /** 리뷰 개수 */
  reviewCount?: number;
  /** 태그 또는 카테고리 목록 */
  tags?: string[];
  /** 위치 정보 */
  location?: string;
  /** 날짜 정보 (예: '2023.10.12 ~ 2023.10.15') */
  date?: string;
  
  /**
   * 카드 레이아웃 형태:
   * - 'vertical': 이미지 상단, 내용 하단 (그리드 뷰에 적합)
   * - 'horizontal': 이미지 좌측, 내용 우측 (리스트 뷰에 적합)
   * - 'compact': 더 작은 형태의 세로형 카드
   */
  variant?: 'vertical' | 'horizontal' | 'compact';
  
  /**
   * 페이지별 외부 크기 및 스타일 조정을 위한 클래스 (예: 'w-full', 'w-[280px]', 'h-64')
   */
  className?: string;

  /** 보관(Keep) 여부 상태 (북마크 아이콘 채움/빈 상태) */
  isKept?: boolean;
  
  /** 보관 버튼 클릭 시 실행할 함수. 전달되면 상단에 북마크(보관) 버튼이 나타납니다. */
  onKeep?: (e: React.MouseEvent) => void;

  /**
   * 카드 클릭 이벤트
   */
  onClick?: () => void;
}

export default function TravelCard({
  title,
  imageUrl,
  imageAlt = "Travel Image",
  description,
  author,
  rating,
  reviewCount,
  tags,
  location,
  date,
  variant = 'vertical',
  className = '',
  isKept = false,
  onKeep,
  onClick,
}: TravelCardProps) {
  // 기본 공통 스타일 (크기 조정은 className에서 주입받음)
  const baseCardStyle = `group relative overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:shadow-md ${
    onClick ? 'cursor-pointer' : ''
  } ${className}`;

  // 이미지가 없을 때의 플레이스홀더
  const ImagePlaceholder = () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
      <span className="text-sm">No Image</span>
    </div>
  );

  // 상단 (절대 위치) 보관(북마크) 버튼
  const KeepButton = () => (
    onKeep ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // 카드 배경 클릭 이벤트와 겹치지 않게 방지
          onKeep(e);
        }}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 p-1.5 text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-purple-600 focus:outline-none"
      >
        <Bookmark className={`h-full w-full transition-colors ${isKept ? 'fill-purple-600 text-purple-600' : ''}`} />
      </button>
    ) : null
  );

  // 별점 UI
  const RatingArea = () => (
    (rating !== undefined || reviewCount !== undefined) && (
      <div className="flex items-center space-x-1 text-sm text-gray-600">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        {rating !== undefined && <span className="font-medium text-gray-900">{rating}</span>}
        {reviewCount !== undefined && <span>({reviewCount})</span>}
      </div>
    )
  );

  if (variant === 'horizontal') {
    return (
      <div className={`${baseCardStyle} flex h-32 w-full sm:h-40`} onClick={onClick}>
        {/* 이미지 영역 (좌측) */}
        <div className="relative h-full w-1/3 min-w-[120px] shrink-0 sm:w-40 sm:min-w-[160px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder />
          )}
          <KeepButton />
        </div>

        {/* 컨텐츠 영역 (우측) */}
        <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
          <div>
            <div className="flex items-start justify-between">
              <h3 className="line-clamp-2 font-semibold text-gray-900">{title}</h3>
            </div>
            {location && (
              <div className="mt-1 flex items-center text-xs text-gray-500 sm:text-sm">
                <MapPin className="mr-1 h-3 w-3" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {description && (
              <p className="mt-1 line-clamp-1 text-xs text-gray-500 sm:mt-2 sm:line-clamp-2 sm:text-sm">
                {description}
              </p>
            )}
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <RatingArea />
            {author && (
              <span className="text-xs text-gray-500">by {author.name}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // vertical & compact
  const isCompact = variant === 'compact';
  
  return (
    <div className={`${baseCardStyle} flex flex-col`} onClick={onClick}>
      {/* 이미지 영역 (상단) */}
      <div className={`relative w-full shrink-0 ${isCompact ? 'aspect-square' : 'aspect-[4/3]'}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <KeepButton />
        
        {/* 태그 영역 (이미지 위 하단) */}
        {tags && tags.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm sm:text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 컨텐츠 영역 (하단) */}
      <div className={`flex flex-col flex-1 ${isCompact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'}`}>
        <div className="flex-1">
          {date && (
            <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-purple-600 sm:text-xs">
              {date}
            </div>
          )}
          
          <h3 className={`font-semibold text-gray-900 ${isCompact ? 'line-clamp-1 text-sm' : 'line-clamp-2 text-base'}`}>
            {title}
          </h3>
          
          {location && (
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <MapPin className="mr-1 h-3 w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {!isCompact && description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>

        {/* 푸터 영역 (별점 및 작성자) */}
        <div className={`mt-2 flex items-center justify-between border-t border-gray-50 pt-2 ${isCompact ? 'mt-1 pt-1' : ''}`}>
          <RatingArea />
          {author && (
            <div className="flex items-center space-x-1.5">
              {author.avatarUrl && (
                <div className="relative h-5 w-5 overflow-hidden rounded-full border border-gray-100">
                  <Image src={author.avatarUrl} alt={author.name} fill className="object-cover" />
                </div>
              )}
              <span className="truncate text-xs text-gray-500">{author.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
