'use client'

import TravelCard from "@/components/display/TravelCard";

export default function Home() {
  return (
    <div>
      <TravelCard
        title="제주 동쪽 3박 4일 코스"
        imageUrl="/images/jeju-east.png"
        description="에메랄드빛 바다와 오름이 어우러진 제주의 동쪽을 탐험하는 3박 4일 여정입니다."
        author={{
          name: "여행가 박지수",
          avatarUrl: "/avatars/park-jisoo.png"
        }}
        rating={4.8}
        reviewCount={124}
        tags={["제주", "동쪽", "오름", "바다", "3박4일"]}
        location="제주특별자치도"
        date="2023.10.12 ~ 2023.10.15"
        variant="vertical"
        className="w-full max-w-sm"
        isKept={true}
        onClick={() => {console.log('clicked!')}}
        onKeep={(e) => {console.log('kept!')}}
      />
    </div>
  );
}
