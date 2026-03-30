"use client";

import { Bell, Bookmark, ChevronRight, Headphones, MapPin, Megaphone, MessageSquare, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MenuList() {
  const router = useRouter();
  const menus = [
    { Icon: MapPin, label: "내 여행 기록", route: "/mypage/triplogs" },
    { Icon: Bookmark, label: "저장한 여행지", route: "/mypage/bookmarks" },
    { Icon: MessageSquare, label: "작성한 리뷰", route: "/mypage/reviews" },
    { Icon: Bell, label: "알림 설정", route: "/mypage/notifications" },
    { Icon: Settings, label: "앱 설정", route: "/mypage/settings" },
    { Icon: Megaphone, label: "공지사항", route: "/mypage/notice" },
    { Icon: Headphones, label: "고객센터", route: "/mypage/customer-support" },
  ];

  return (
    <section className="flex flex-col pt-4 mx-auto w-full max-w-2xl px-2 md:px-0">
      {menus.map(({ Icon, label, route }, idx) => (
        <button 
          key={idx} 
          onClick={() => {
            router.push(route);
          }}
          className="flex items-center justify-between w-full px-4 py-[18px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group rounded-xl"
        >
          <div className="flex items-center gap-4">
            <Icon className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{label}</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" strokeWidth={2} />
        </button>
      ))}
    </section>
  );
}
