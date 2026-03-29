'use client'
 
import TravelCard from '@/components/display/TravelCard';
import StatCardGroup from '@/components/domain/my-page/StatCardGroup';
import { createClient } from '@/utils/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
 
interface TripLog {
  id: string;
  title: string;
  date: string;
  memo: string;
  status: 'Completed';
  imageUrl: string;
  distance: number;
  time: string;
  spotCount: number;
  cost: number;
  rating: number;
  reviewCount: number;
}
 
export default function TriplogsPage() {
  const [trips, setTrips] = useState<TripLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();
 
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
 
        const userId = session.user.id;
 
        // 1. trips 테이블에서 시작하며 travelers가 'completed'인 데이터만 조인해서 가져오기
        const { data: rawTrips, error: tripsError } = await supabase
          .from('trips')
          .select('*, travelers!inner(*)')
          .eq('travelers.user_id', userId)
          .eq('travelers.status', 'completed')
          .order('start_date', { ascending: false });
 
        if (tripsError) throw tripsError;
 
        if (!rawTrips || rawTrips.length === 0) {
          setTrips([]);
          return;
        }
 
        const tripIds = (rawTrips as any[]).map(t => t.id);
 
        // 2. 여행 아이템(장소 개수) 및 리뷰(평점) 가져오기
        const [{ data: itemsData }, { data: reviewsData }] = await Promise.all([
          supabase.from('trip_items').select('trip_id').in('trip_id', tripIds),
          supabase.from('reviews').select('*').in('trip_id', tripIds)
        ]);
 
        // 데이터 정제
        const transformedTrips: TripLog[] = rawTrips.map(trip => {
          const tripItems = itemsData?.filter(item => item.trip_id === trip.id) || [];
          const tripReviews = reviewsData?.filter(rev => rev.trip_id === trip.id) || [];
          
          const avgRating = tripReviews.length > 0 
            ? tripReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / tripReviews.length 
            : 0;
 
          const totalMinutes = trip.total_travel_time || 0;
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          const timeStr = hours > 0 ? `${hours}시간 ${mins > 0 ? `${mins}분` : ''}` : `${mins}분`;
 
          return {
            id: String(trip.id),
            title: trip.title || '제목 없는 여행',
            date: trip.start_date ? new Date(trip.start_date).toLocaleDateString() : '-',
            memo: '', 
            status: 'Completed',
            imageUrl: '/images/jeju-east.png', 
            distance: trip.total_distance || 0,
            time: timeStr,
            spotCount: tripItems.length,
            cost: trip.total_cost || 0,
            rating: Number(avgRating.toFixed(1)),
            reviewCount: tripReviews.length
          };
        });
 
        setTrips(transformedTrips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };
 
    fetchTrips();
  }, []);
  
  const overallStats = useMemo(() => {
    const totalDistance = trips.reduce((sum, t) => sum + t.distance, 0);
    const tripCount = trips.length;
    const reviewCount = trips.reduce((sum, t) => sum + t.reviewCount, 0);
 
    return {
      triplogCount: tripCount,
      totalDistance: Number(totalDistance.toFixed(1)),
      reviewCount
    };
  }, [trips]);
 
  const filteredHistory = trips.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 1. Header Area */}
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
        {/* 2. Stats Section */}
        <div className="mb-12">
            <StatCardGroup 
                triplogCount={overallStats.triplogCount}
                totalDistance={overallStats.totalDistance}
                reviewCount={overallStats.reviewCount}
            />
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
                  {!loading ? filteredHistory.length : '-'}
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
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                  <p className="text-sm font-medium text-gray-400">데이터를 불러오는 중입니다...</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredHistory.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TravelCard
                        id={trip.id}
                        variant="horizontal"
                        title={trip.title}
                        imageUrl={trip.imageUrl}
                        category="추억 기록"
                        isHot={false}
                        summary={{
                          totalDistance: trip.distance,
                          totalTime: trip.time,
                          spotCount: trip.spotCount,
                          estimatedCost: trip.cost,
                          saveCount: 0
                        }}
                        avgStats={{
                          incline: '평지',
                          stairs: '없음',
                          shade: '보통'
                        }}
                        rating={trip.rating}
                        reviewCount={trip.reviewCount}
                        isKept={true}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
 
              {!loading && filteredHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                  <Search className="h-10 w-10 mb-4 opacity-20" />
                  <p className="text-sm font-medium">기록이 없거나 검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
