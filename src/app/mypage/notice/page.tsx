"use client";

import { ChevronLeft, ChevronRight, Megaphone, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NOTICES = [
  {
    id: 1,
    title: "뚜벅 서비스 점검 안내 (4/1 00:00 ~ 04:00)",
    date: "2026.03.30",
    isNew: true,
    tag: "점검",
  },
  {
    id: 2,
    title: "봄 맞이 걷기 대회 이벤트 당첨 공지",
    date: "2026.03.28",
    isNew: false,
    tag: "이벤트",
  },
  {
    id: 3,
    title: "개인정보 처리방침 개정 안내",
    date: "2026.03.25",
    isNew: false,
    tag: "공지",
  },
  {
    id: 4,
    title: "신규 테마 코스 업데이트 안내",
    date: "2026.03.20",
    isNew: false,
    tag: "업데이트",
  },
  {
    id: 5,
    title: "뚜벅 앱 버전 1.2.0 업데이트 소식",
    date: "2026.03.15",
    isNew: false,
    tag: "업데이트",
  },
];

export default function NoticePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotices = NOTICES.filter((notice) =>
    notice.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-max-w-2xl px-4 py-4 flex items-center gap-4">
          <Link 
            href="/mypage" 
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">공지사항</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {/* Search Bar */}
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="공지사항 제목으로 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl focus:bg-white dark:focus:bg-gray-800 focus:border-purple-200 dark:focus:border-purple-800 outline-none transition-all text-[15px] font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        {/* Notice List */}
        <section className="flex flex-col gap-3">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <Link 
                key={notice.id} 
                href={`/mypage/notice/${notice.id}`}
                className="group flex flex-col p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md transition-all bg-white dark:bg-gray-900 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      notice.tag === "점검" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30" :
                      notice.tag === "이벤트" ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30" :
                      notice.tag === "업데이트" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30" :
                      "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
                    }`}>
                      {notice.tag}
                    </span>
                    {notice.isNew && (
                      <span className="flex h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-500" />
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
                </div>
                
                <h2 className="text-[16px] font-bold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors mb-3">
                  {notice.title}
                </h2>
                
                <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
                  {notice.date}
                </span>
                
                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Megaphone className="w-12 h-12 opacity-20 mb-4" />
              <p className="text-[15px] font-medium">검색 결과가 없습니다.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
