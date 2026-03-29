'use client'

import { createClient } from '@/utils/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Edit2, Image as ImageIcon, MessageSquare, MoreVertical, Star, ThumbsUp, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

interface Review {
  id: string;
  trip_id: number;
  rating: number;
  content: string;
  created_at: string;
  trips: {
    title: string;
    start_date: string;
    end_date: string;
  };
  images: {
    file_url: string;
  }[];
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'rating'>('latest');
  const supabase = createClient();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        // Fetch reviews with joined trip and image data
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            trips (
              title,
              start_date,
              end_date
            ),
            images (
              file_url
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });
  }, [reviews, sortBy]);

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews 
      : 0;
    
    return [
      { label: '전체 리뷰', value: String(totalReviews), icon: MessageSquare, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    ];
  }, [reviews]);

  const handleDelete = async (reviewId: string) => {
     if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;
     
     try {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);
        
        if (error) throw error;
        
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setActiveMenu(null);
     } catch (err) {
        console.error('Error deleting review:', err);
        alert('리뷰 삭제 중 오류가 발생했습니다.');
     }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
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
            <h1 className="text-xl font-bold tracking-tight text-gray-900">작성한 리뷰</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Stats & Sort */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">전체 리뷰</h2>
              <span className="text-lg font-extrabold text-purple-600">{reviews.length}</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">작성하신 소중한 후기들을 확인해보세요</p>
          </div>

          <div className="flex items-center bg-gray-100/50 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setSortBy('latest')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'latest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              최신순
            </button>
            <button 
              onClick={() => setSortBy('rating')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'rating' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              별점순
            </button>
          </div>
        </div>

        {/* Review List Container */}
        <div className="space-y-4">

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">리뷰를 불러오는 중입니다...</p>
             </div>
          ) : (
            <AnimatePresence>
              {sortedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all"
                >
                  <div className="flex gap-5">
                    {/* Left: Course Image */}
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-50 flex-shrink-0">
                      <Image 
                        src="/images/jeju-east.png" 
                        alt={review.trips?.title || 'Trip'} 
                        fill 
                        className="object-cover transition-transform group-hover:scale-105" 
                      />
                    </div>

                    {/* Right: Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="min-w-0 pr-4">
                          <h3 className="text-[17px] font-bold text-gray-900 truncate mb-1">
                            {review.trips?.title || '제목 없는 여행'}
                          </h3>
                          <div className="flex items-center gap-2.5">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
                                />
                              ))}
                            </div>
                              <div className="text-xs text-gray-400">
                                {review.created_at 
                                  ? new Date(review.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
                                  : '-'}
                              </div>
                          </div>
                        </div>

                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === review.id ? null : review.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {activeMenu === review.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-10">
                              <Link 
                                href={`/review/edit?reviewId=${review.id}`}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" /> 수정하기
                              </Link>
                              <button 
                                onClick={() => handleDelete(review.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" /> 삭제하기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-[14px] leading-relaxed text-gray-600 line-clamp-2 mb-4">
                        {review.content}
                      </p>

                      <div className="flex items-end justify-between">
                        {review.images && review.images.length > 0 ? (
                           <div className="flex gap-1.5">
                            {review.images.slice(0, 3).map((img, i) => (
                              <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                <Image src={img.file_url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                                {i === 2 && review.images.length > 3 && (
                                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-bold text-white">
                                      +{review.images.length - 2}
                                   </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : <div />}

                        {review.images && review.images.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                                <ImageIcon className="h-3 w-3" />
                                Review Photos
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Empty State */}
        {!loading && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-gray-100 p-8 rounded-full mb-6">
              <MessageSquare className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">작성한 리뷰가 없습니다</h3>
            <p className="text-gray-500 mb-8 max-w-xs px-4">
              다녀온 여행지에 대한 소중한 후기를 남겨주세요!
            </p>
            <Link 
              href="/mypage/triplogs" 
              className="px-8 py-3.5 bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all hover:scale-[1.02]"
            >
              내 기록 확인하러 가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
