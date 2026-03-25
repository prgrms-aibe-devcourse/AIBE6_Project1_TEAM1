"use client";

import TravelCard from "@/components/display/TravelCard";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";

export default function Main() {

  const supabase = createClient();

  const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
      }
    };


  useEffect(() => {
    fetchUser();
  }, []);

  // 임시 더미 데이터 배열 (추후 API 연동 시 교체)
  const dummyTravels = [
    {
      id: 1,
      title: "제주 동쪽 3박 4일 코스",
      imageUrl: "/images/jeju-east.png",
      description: "에메랄드빛 바다와 오름이 어우러진 제주의 동쪽을 탐험하는 3박 4일 여정입니다.",
      author: { name: "여행가 박지수", avatarUrl: "/avatars/park-jisoo.png" },
      rating: 4.8,
      reviewCount: 124,
      tags: ["제주", "동쪽", "오름", "바다"],
      location: "제주특별자치도",
      date: "2023.10.12",
      isKept: true,
    },
    {
      id: 2,
      title: "강릉 당일치기 맛집 투어",
      imageUrl: "/images/jeju-east.png", // 일단 같은 임시 이미지 사용
      description: "바다를 보며 즐기는 커피 한 잔과 꿀맛 같은 해산물 파티!",
      author: { name: "먹방요정", avatarUrl: "/avatars/park-jisoo.png" },
      rating: 4.5,
      reviewCount: 89,
      tags: ["강릉", "맛집", "카페", "당일치기"],
      location: "강원특별자치도 강릉시",
      date: "2023.11.05",
      isKept: false,
    },
    {
      id: 3,
      title: "남해 해안선 힐링 드라이브",
      imageUrl: "/images/jeju-east.png",
      description: "가슴이 뻥 뚫리는 해안 도로를 따라 달리는 속 시원한 드라이브 코스입니다.",
      author: { name: "베스트드라이버", avatarUrl: "/avatars/park-jisoo.png" },
      rating: 4.9,
      reviewCount: 210,
      tags: ["남해", "드라이브", "바다", "힐링"],
      location: "경상남도 남해군",
      date: "2023.09.20",
      isKept: false,
    },
    {
      id: 4,
      title: "부산 화려한 밤바다 산책",
      imageUrl: "/images/jeju-east.png",
      description: "광안부터 해운대까지 이어지는 화려고 시원한 밤바다 산책.",
      author: { name: "야경홀릭", avatarUrl: "/avatars/park-jisoo.png" },
      rating: 4.7,
      reviewCount: 342,
      tags: ["부산", "야경", "해운대", "광안리"],
      location: "부산광역시 해운대구",
      date: "2023.08.15",
      isKept: true,
    }
  ];

  return (
    <div className="w-full pt-4">
      {/* 헤더/타이틀 영역 */}
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold text-gray-900">추천 여행 일정</h2>
        <span className="cursor-pointer text-sm font-medium text-purple-600 hover:underline">
          더보기
        </span>
      </div>

      {/* 카드 그리드 영역 */}
      {/* 모바일: 1열, 태블릿: 2열, PC: 3열, 더 큰 디스플레이: 4열 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
        {dummyTravels.map((travel) => (
          <TravelCard
            key={travel.id}
            title={travel.title}
            imageUrl={travel.imageUrl}
            description={travel.description}
            author={travel.author}
            rating={travel.rating}
            reviewCount={travel.reviewCount}
            tags={travel.tags}
            location={travel.location}
            date={travel.date}
            variant="vertical"
            // className을 비워두어 그리드 템플릿의 컬럼 너비를 꽉 채우도록 함
            className="w-full"
            isKept={travel.isKept}
            onClick={() => console.log(`${travel.title} 카드 클릭!`)}
            onKeep={(e) => {
              e.stopPropagation();
              console.log(`${travel.title} 보관 버튼 클릭!`);
            }}
          />
        ))}
      </div>
    </div>
  );
}