'use client'

import TravelCard from '@/components/display/TravelCard';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Dummy data for saved courses
const SAVED_COURSES = [
  {
    id: '1',
    title: '영도 흰여울문화마을 산책 코스',
    location: '부산 영도구',
    time: '2시간 30분',
    category: 'Coast',
    imageUrl: '/images/jeju-east.png',
    distance: 3.2,
    rating: 4.2,
    reviewCount: 128,
  },
  {
    id: '2',
    title: '서울 숲 힐링 산책로',
    location: '서울 성동구',
    time: '1시간 40분',
    category: 'Forest',
    imageUrl: '/images/jeju-east.png',
    distance: 2.5,
    rating: 4.8,
    reviewCount: 320,
  },
  {
    id: '3',
    title: '광화문 역사 밤거리 걷기',
    location: '서울 종로구',
    time: '2시간',
    category: 'City',
    imageUrl: '/images/jeju-east.png',
    distance: 4.0,
    rating: 4.5,
    reviewCount: 210,
  },
  {
    id: '4',
    title: '제주 사려니숲길 삼나무 코스',
    location: '제주 제주시',
    time: '3시간',
    category: 'Forest',
    imageUrl: '/images/jeju-east.png',
    distance: 5.2,
    rating: 4.9,
    reviewCount: 450,
  },
  {
    id: '5',
    title: '경주 대릉원 돌담길',
    location: '경북 경주시',
    time: '1시간 20분',
    category: 'City',
    imageUrl: '/images/jeju-east.png',
    distance: 1.8,
    rating: 4.7,
    reviewCount: 180,
  },
  {
    id: '6',
    title: '강릉 안목해변 커피거리 산책',
    location: '강원 강릉시',
    time: '1시간 50분',
    category: 'Coast',
    imageUrl: '/images/jeju-east.png',
    distance: 3.0,
    rating: 4.6,
    reviewCount: 290,
  },
];

const FILTERS = ['All', 'Forest', 'City', 'Coast'];

export default function BookmarksPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCourses = activeFilter === 'All' 
    ? SAVED_COURSES 
    : SAVED_COURSES.filter(course => course.category === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Area */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/mypage" 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">저장한 여행</h1>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-sm font-bold text-purple-700">
                {SAVED_COURSES.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeFilter === filter
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                    : 'bg-white text-gray-500 ring-1 ring-black/5 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {filter === 'All' ? '전체' : 
                 filter === 'Forest' ? '숲' : 
                 filter === 'City' ? '도심' : '해안'}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Filter className="h-4 w-4" />
            <span>최신순</span>
          </div>
        </div>

        {/* Grid Layout */}
        <motion.div 
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode='popLayout'>
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <TravelCard
                  id={course.id}
                  title={course.title}
                  imageUrl={course.imageUrl}
                  category={course.category === 'Forest' ? '숲 산책' : course.category === 'City' ? '도심 산책' : '해안 산책'}
                  isHot={index < 2}
                  summary={{
                    totalDistance: course.distance,
                    totalTime: course.time,
                    spotCount: 5,
                    estimatedCost: 2400,
                    saveCount: 1024,
                  }}
                  avgStats={{
                    incline: '완만',
                    stairs: '적음',
                    shade: '보통',
                  }}
                  rating={course.rating}
                  reviewCount={course.reviewCount}
                  isKept={true}
                  onKeep={(id) => console.log('Keep toggle:', id)}
                  onClick={() => console.log('Navigate to:', course.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <Filter className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">저장된 코스가 없습니다</h3>
            <p className="mt-1 text-gray-500">관심 있는 코스를 하트 버튼으로 저장해보세요!</p>
          </div>
        )}
      </main>
    </div>
  );
}
