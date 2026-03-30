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
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-max-w-2xl px-4 py-4 flex items-center gap-4">
          <Link 
            href="/mypage" 
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">공지사항</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {/* Search Bar */}
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            type="text"
            placeholder="공지사항 제목으로 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-purple-200 outline-none transition-all text-[15px] font-medium placeholder:text-gray-400"
          />
        </div>

        {/* Notice List */}
        <section className="flex flex-col gap-3">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <Link 
                key={notice.id} 
                href={`/mypage/notice/${notice.id}`}
                className="group flex flex-col p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all bg-white relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      notice.tag === "점검" ? "bg-red-50 text-red-600 border border-red-100" :
                      notice.tag === "이벤트" ? "bg-orange-50 text-orange-600 border border-orange-100" :
                      notice.tag === "업데이트" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                      "bg-gray-50 text-gray-600 border border-gray-100"
                    }`}>
                      {notice.tag}
                    </span>
                    {notice.isNew && (
                      <span className="flex h-2 w-2 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
                
                <h2 className="text-[16px] font-bold text-gray-900 leading-snug group-hover:text-purple-700 transition-colors mb-3">
                  {notice.title}
                </h2>
                
                <span className="text-[13px] text-gray-400 font-medium">
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
