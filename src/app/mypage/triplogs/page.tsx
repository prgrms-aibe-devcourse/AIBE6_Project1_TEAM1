'use client'

import TravelCard from '@/components/display/TravelCard';
import { motion } from 'framer-motion';
import { ChevronLeft, Footprints, Route, Search, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Dummy data for travel history
const HISTORY_DATA = [
  {
    id: '1',
    title: '부산 영도 흰여울마을 & 감천문화마을',
    date: '2024.03.15',
    memo: '부산의 파란 바다를 실컷 보며 걸었던 하루',
    status: 'Completed' as const,
    imageUrl: '/images/jeju-east.png',
    distance: 4.2,
    time: '3시간',
  },
  {
    id: '2',
    title: '서울 경복궁 & 서촌 역사 산책',
    date: '2024.02.28',
    memo: '눈 내린 고궁의 고즈넉함과 서촌의 아기자기한 매력',
    status: 'Completed' as const,
    imageUrl: '/images/jeju-east.png',
    distance: 3.5,
    time: '2시간 30분',
  },
  {
    id: '3',
    title: '제주 올레길 7코스 완주',
    date: '2024.02.10',
    memo: '외돌개에서 만난 환상적인 일몰',
    status: 'Completed' as const,
    imageUrl: '/images/jeju-east.png',
    distance: 14.8,
    time: '5시간',
  },
  {
    id: '4',
    title: '경주 불국사 & 다보탑 가을 나들이',
    date: '2023.11.20',
    memo: '단풍이 무르익은 불국사 사계절 중 최고',
    status: 'Completed' as const,
    imageUrl: '/images/jeju-east.png',
    distance: 2.8,
    time: '2시간',
  },
];

const STATS = [
  { label: '총 거리', value: '142.5', unit: 'km', icon: Route, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { label: '완주한 코스', value: '48', unit: '코스', icon: Trophy, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { label: '총 이동시간', value: '254,821', unit: '시간', icon: Footprints, color: 'text-pink-500', bgColor: 'bg-pink-50' },
];

export default function HaveBeenPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = HISTORY_DATA.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 1. Header Area (Clean White) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/mypage" 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">나의 뚜벅 기록</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* 2. Stats Section (Individual White Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`mb-6 p-4 rounded-2xl ${stat.bgColor} ${stat.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-tight">{stat.label}</span>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{stat.value}</span>
                    <span className="text-xs font-bold text-gray-400">{stat.unit}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. List Container */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 md:p-10">
            {/* Search Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">기록 리스트</h2>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full ml-1">
                  {filteredHistory.length}
                </span>
              </div>
              
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="장소 또는 제목을 검색하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 rounded-2xl bg-gray-50 pl-11 pr-4 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all border border-transparent hover:border-gray-200"
                />
              </div>
            </div>

            {/* History List */}
            <div className="space-y-6">
              {filteredHistory.map((trip, index) => (
                <TravelCard
                  key={trip.id}
                  id={trip.id}
                  variant="horizontal"
                  title={trip.title}
                  imageUrl={trip.imageUrl}
                  category="추억 기록"
                  isHot={false}
                  summary={{
                    totalDistance: trip.distance,
                    totalTime: trip.time,
                    spotCount: 4,
                    estimatedCost: 15000,
                    saveCount: 0
                  }}
                  avgStats={{
                    incline: '평지',
                    stairs: '없음',
                    shade: '보통'
                  }}
                  rating={4.8}
                  reviewCount={1}
                  isKept={true}
                />
              ))}

              {filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                  <Search className="h-10 w-10 mb-4 opacity-20" />
                  <p className="text-sm font-medium">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
