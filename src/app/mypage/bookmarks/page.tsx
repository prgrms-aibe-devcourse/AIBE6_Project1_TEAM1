'use client'

import TravelCard from '@/components/display/TravelCard';
import { createClient } from '@/utils/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


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
  tags?: string[];
}

export default function BookmarksPage() {
  const [courses, setCourses] = useState<SavedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        /**
         * 1. 'bookmark' 테이블에서 현재 사용자가 저장한 trip_id 목록을 가져옵니다.
         * 이때 'trips' 테이블을 조인(Join)하여 여행 정보를 한꺼번에 가져옵니다.
         */
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from('bookmark')
          .select(`
<<<<<<< HEAD
            trips_id,
=======
            trip_id,
>>>>>>> bcb3a0e (Feat : 저장페이지 조회기능 구현중)
            created_at,
            trips (
              *
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: sortBy === 'oldest' });

        if (bookmarkError) {
          console.error('Bookmark Table Fetch Error Raw:', bookmarkError);
          console.error('Bookmark Table Fetch Error Stringified:', JSON.stringify(bookmarkError, null, 2));
          throw bookmarkError;
        }

        if (!bookmarkData || bookmarkData.length === 0) {
          setCourses([]);
          return;
        }

        // 조인된 데이터에서 trips 정보만 추출합니다.
        // Supabase의 join 결과는 관계 설정에 따라 객체일 수도, 배열일 수도 있으므로 안전하게 처리합니다.
        const tripsData = bookmarkData
          .map((b: any) => Array.isArray(b.trips) ? b.trips[0] : b.trips)
          .filter(t => t !== null) as any[];

        // 중복 제거: 같은 여행지가 여러 번 북마크되어 있을 경우를 대비해 ID 기준으로 유니크하게 필터링합니다.
        const uniqueTrips = Array.from(new Map(tripsData.map(t => [t.id, t])).values());

        const tripsIds = uniqueTrips.map(t => t.id);

        /**
         * 2. 각 여행지에 대한 리뷰 정보를 가져와 평균 평점을 계산합니다.
         */
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('trip_id, rating')
          .in('trip_id', tripsIds);

        if (reviewsError) throw reviewsError;

        /**
         * 3. UI에 표시할 형식으로 데이터를 변환합니다.
         */
        const transformed: SavedCourse[] = uniqueTrips.map(trip => {
          const tripReviews = reviewsData?.filter(rev => rev.trip_id === trip.id) || [];
          const avgRating = tripReviews.length > 0 
            ? tripReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / tripReviews.length 
            : 0;

          const totalMinutes = trip.total_travel_time || 0;
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const timeStr = hours > 0 ? `${hours}시간 ${mins > 0 ? `${mins}분` : ''}` : `${mins}분`;

          // 태그 문자열을 배열로 변환
          const tagsArray = trip.tags ? trip.tags.split(/[#\s]+/).filter(Boolean) : [];

          return {
            id: String(trip.id),
            title: trip.title || '제목 없는 여행',
            location: '도심', 
            time: timeStr,
            category: tagsArray.includes('숲') ? 'Forest' : tagsArray.includes('해안') ? 'Coast' : 'City',
            imageUrl: trip.img_url || '/images/jeju-east.png',
            distance: trip.total_distance || 0,
            rating: Number(avgRating.toFixed(1)),
            reviewCount: tripReviews.length,
            tags: tagsArray
          };
        });

        setCourses(transformed);
      } catch (err: any) {
        console.error('Error fetching bookmarks final catch:', err);
        try {
          console.error('Error JSON:', JSON.stringify(err, null, 2));
        } catch (e) {
          console.error('Error could not be stringified');
        }
        if (err && typeof err === 'object') {
          console.error('Error Keys:', Object.keys(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [supabase, sortBy]);

  const handleToggleBookmark = async (tripId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 'bookmarks' 테이블에서 해당 사용자와 여행지의 북마크를 삭제합니다.
      const { error } = await supabase
        .from('bookmark')
        .delete()
        .eq('user_id', session.user.id)
        .eq('trip_id', tripId);

      if (error) throw error;

      // 로컬 상태에서 해당 항목을 제거합니다.
      setCourses(prev => prev.filter(course => course.id !== tripId));
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50 pb-20">
      {/* Header Area */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/mypage" 
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">저장한 여행</h1>
              <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/40 px-2.5 py-0.5 text-sm font-bold text-purple-700 dark:text-purple-400">
                {!loading ? courses.length : '-'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Section */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-purple-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">저장된 코스</h2>
          </div>
          
          <button 
            onClick={() => setSortBy(prev => prev === 'latest' ? 'oldest' : 'latest')}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group px-2 py-1 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Filter className={`h-4 w-4 transition-transform ${sortBy === 'oldest' ? 'rotate-180' : ''}`} />
            <span>{sortBy === 'latest' ? '최신순' : '오래된순'}</span>
          </button>
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
              {courses.map((course, index) => (
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
                      spotCount: course.reviewCount > 0 ? 5 : 3, // 예시값
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
                    onKeep={handleToggleBookmark}
                    onClick={() => router.push(`/search/${course.id}`)}
                    tags={course.tags}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-gray-100 dark:bg-gray-800 p-6">
              <Filter className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">저장된 코스가 없습니다</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">관심 있는 코스를 하트 버튼으로 저장해보세요!</p>
          </div>
        )}
      </main>
    </div>
  );
}
