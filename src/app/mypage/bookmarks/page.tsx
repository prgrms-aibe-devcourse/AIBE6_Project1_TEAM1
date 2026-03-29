'use client'

import TravelCard from '@/components/display/TravelCard';
import { createClient } from '@/utils/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

const FILTERS = ['All', 'Forest', 'City', 'Coast'];

interface SavedCourse {
  id: string;
  title: string;
  location: string;
  time: string;
  category: string;
  imageUrl: string;
  distance: number;
  rating: number;
  reviewCount: number;
}

export default function BookmarksPage() {
  const [courses, setCourses] = useState<SavedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const supabase = createClient();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        // Fetch trips that are 'saved' by this user
        // Using is_saved for now as there's no dedicated bookmarks table yet
        const { data: tripsData, error: tripsError } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', userId)
          .eq('is_saved', true)
          .order('start_date', { ascending: false });

        if (tripsError) throw tripsError;

        if (!tripsData || tripsData.length === 0) {
          setCourses([]);
          return;
        }

        const tripIds = tripsData.map(t => t.id);

        // Fetch reviews for these trips
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('trip_id, rating')
          .in('trip_id', tripIds);

        if (reviewsError) throw reviewsError;

        const transformed: SavedCourse[] = tripsData.map(trip => {
          const tripReviews = reviewsData?.filter(rev => rev.trip_id === trip.id) || [];
          const avgRating = tripReviews.length > 0 
            ? tripReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / tripReviews.length 
            : 0;

          // Format time
          const totalMinutes = trip.total_travel_time || 0;
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const timeStr = hours > 0 ? `${hours}시간 ${mins > 0 ? `${mins}분` : ''}` : `${mins}분`;

          return {
            id: String(trip.id),
            title: trip.title || '제목 없는 여행',
            location: '도심', // Fallback as trips doesn't have category/location yet
            time: timeStr,
            category: 'City', // Fallback
            imageUrl: '/images/jeju-east.png',
            distance: trip.total_distance || 0,
            rating: Number(avgRating.toFixed(1)),
            reviewCount: tripReviews.length
          };
        });

        setCourses(transformed);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const filteredCourses = useMemo(() => {
    if (activeFilter === 'All') return courses;
    return courses.filter(course => course.category === activeFilter);
  }, [courses, activeFilter]);

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
                {!loading ? courses.length : '-'}
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p>불러오는 중...</p>
             </div>
          ) : (
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
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Empty State */}
        {!loading && filteredCourses.length === 0 && (
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
