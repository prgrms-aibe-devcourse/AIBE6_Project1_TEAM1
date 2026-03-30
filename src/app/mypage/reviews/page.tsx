'use client'

import { deleteReview } from '@/components/domain/review/useDeleteReview'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  Edit2,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  MoreVertical,
  Star,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

/**
 * 1. 데이터 타입 정의 (Interface)
 * 서버에서 받아올 리뷰 데이터의 구조를 미리 정의합니다.
 */
interface Review {
  id: string // 리뷰 고유 ID
  trip_id: number // 연결된 여행 ID
  rating: number // 별점 (1~5)
  content: string // 리뷰 내용
  created_at: string // 작성일자 (ISO string)
  trips: {
    // 조인(Join)하여 가져온 여행 정보
    title: string
    start_date: string
    end_date: string
  }
  images: {
    // 조인(Join)하여 가져온 리뷰 사진들
    file_url: string
  }[]
}

export default function ReviewsPage() {
  /**
   * 2. 상태 관리 (State)
   * UI의 변화를 추적하기 위해 상태를 정의합니다.
   */
  const [reviews, setReviews] = useState<Review[]>([]) // 서버에서 받아온 리뷰 목록
  const [loading, setLoading] = useState(true) // 데이터를 불러오는 중인지 여부
  const [activeMenu, setActiveMenu] = useState<string | null>(null) // 현재 열려있는 '수정/삭제' 메뉴 ID
  const [sortBy, setSortBy] = useState<'latest' | 'rating'>('latest') // 현재 정렬 기준 (최신순/별점순)
  const supabase = createClient() // 수파베이스 클라이언트 인스턴스
  const router = useRouter()
  const { openModal } = useModalStore()
  const searchParams = useSearchParams()
  // tripId를 숫자로 변환
  const tripIdParam = searchParams.get('tripId')
  const tripId = tripIdParam ? Number(tripIdParam) : undefined

  /**
   * 3. 데이터 패칭 (useEffect)
   * 페이지가 처음 로드될 때 실행되어 서버에서 데이터를 가져옵니다.
   */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        // 로그인한 사용자 세션 정보를 확인합니다.
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) return

        const userId = session.user.id

        /**
         * 수파베이스 쿼리:
         * 1) 'reviews' 테이블에서 데이터를 가져옵니다.
         * 2) 'trips'와 'images' 테이블도 함께 조인(Join)하여 필요한 정보를 한꺼번에 가져옵니다.
         * 3) 현재 로그인한 사용자(user_id)의 데이터만 필터링합니다.
         */
        // Fetch reviews with joined trip and image data
        const { data, error } = await supabase
          .from('reviews')
          .select(
            `
            *,
            trips (
              title,
              start_date,
              end_date
            ),
            images (
              file_url
            )
          `,
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        const processedReviews: Review[] = (data ?? []).map((row) => ({
          id: String(row.id),
          trip_id: Number(row.trip_id),
          rating: row.rating ?? 0,
          content: row.content ?? '',
          created_at: row.created_at ?? '',
          // trips가 배열이면 첫 번째, 객체면 그대로, 없으면 기본값
          trips: Array.isArray(row.trips)
            ? (row.trips[0] ?? { title: '', start_date: '', end_date: '' })
            : (row.trips ?? { title: '', start_date: '', end_date: '' }),
          images: Array.isArray(row.images)
            ? (row.images
                .map((img: { file_url?: string } | null) => {
                  if (img && img.file_url) return { file_url: img.file_url }
                  return null
                })
                .filter(Boolean) as { file_url: string }[])
            : [],
        }))

        // tripId가 있으면 필터링 후 state에 설정
        setReviews(
          tripId
            ? processedReviews.filter((review) => review.trip_id === tripId)
            : processedReviews,
        )
      } catch (err) {
        console.error('리뷰를 불러오는 중 오류가 발생했습니다:', err)
      } finally {
        setLoading(false) // 로딩 완료
      }
    }

    fetchReviews()
  }, [])

  /**
   * 4. 데이터 가공 (useMemo)
   * 정렬 기준(sortBy)이나 리뷰 목록이 바뀔 때만 실행되어 성능을 최적화합니다.
   */
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'latest') {
        // 일시를 기준으로 내림차순 정렬 (최신순)
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      } else {
        // 별점을 기준으로 내림차순 정렬 (별점순)
        return (b.rating || 0) - (a.rating || 0)
      }
    })
  }, [reviews, sortBy])

  const stats = useMemo(() => {
    const totalReviews = reviews.length
    // const avgRating = totalReviews > 0
    //   ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews
    //   : 0;

    return [
      {
        label: '전체 리뷰',
        value: String(totalReviews),
        icon: MessageSquare,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      },
    ]
  }, [reviews])

  /**
   * 5. 리뷰 삭제 기능
   * 사용자에게 확인을 받은 후, 전용 훅을 통해 삭제를 진행합니다.
   */
  const handleDelete = async (reviewId: string) => {
    if (!reviewId) return

    openModal({
      type: 'confirm',
      variant: 'danger',
      title: '리뷰를 삭제하시겠습니까?',
      description: '삭제된 데이터는 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
      onConfirm: async () => {
        try {
          await deleteReview(supabase, Number(reviewId), openModal, router)
          // 삭제 후 로컬 상태에서 제거
          setReviews((prev) => prev.filter((r) => r.id !== reviewId))
          setActiveMenu(null)
        } catch (err) {
          console.error('리뷰 삭제 중 오류가 발생했습니다:', err)
        }
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* (1) 상단 헤더: 뒤로가기 버튼과 타이틀 */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/mypage"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              작성한 리뷰
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* (2) 통계 및 정렬 영역: 전체 개수 확인과 최신순/별점순 전환 */}
        {/* Header with Stats & Sort */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {tripId ? '해당 코스 리뷰' : '전체 리뷰'}
              </h2>
              <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                {reviews.length}
              </span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
              작성하신 소중한 후기들을 확인해보세요
            </p>
          </div>

          <div className="flex items-center bg-gray-100/50 dark:bg-gray-900/50 border border-transparent dark:border-gray-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'latest'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy('rating')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'rating'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              별점순
            </button>
          </div>
        </div>

        {/* (3) 리뷰 리스트: 로딩 중일 때는 스피너를, 완료 후에는 카드 목록을 보여줍니다. */}
        {/* Review List Container */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-400 font-medium">
                리뷰를 불러오는 중입니다...
              </p>
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
                  className="group relative bg-white dark:bg-gray-900/50 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-purple-100 dark:hover:border-purple-800/50 transition-all"
                >
                  <div className="flex gap-5">
                    {/* (카드 왼쪽) 여행 코스 이미지 */}
                    {/* Left: Course Image */}
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-50 dark:border-gray-800 flex-shrink-0">
                      <Image
                        src="/images/jeju-east.png"
                        alt={review.trips?.title || 'Trip'}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>

                    {/* (카드 오른쪽) 리뷰 정보 (제목, 별점, 날짜, 내용) */}
                    {/* Right: Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="min-w-0 pr-4">
                          <h3 className="text-[17px] font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {review.trips?.title || '제목 없는 여행'}
                          </h3>
                          <div className="flex items-center gap-2.5">
                            <div className="flex gap-0.5">
                              {/* 별점 5개 기준으로 채워진 별과 빈 별을 표시합니다. */}
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">
                              {review.created_at
                                ? new Date(review.created_at)
                                    .toLocaleDateString('ko-KR', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                    })
                                    .replace(/\. /g, '.')
                                    .replace(/\.$/, '')
                                : '-'}
                            </span>
                          </div>
                        </div>

                        {/* 우측 상단 '더보기' 메뉴 (수정/삭제) */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === review.id ? null : review.id,
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenu === review.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-10">
                              <Link
                                href={`/review/edit?reviewId=${review.id}`}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" /> 수정하기
                              </Link>
                              <button
                                onClick={() => handleDelete(review.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" /> 삭제하기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 리뷰 텍스트 (길어질 경우 2줄까지만 보여줍니다.) */}
                      <p className="text-[14px] leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl">
                        {review.content}
                      </p>

                      {/* 하단 영역: 첨부된 사진 갤러리 */}
                      <div className="flex items-end justify-between">
                        {review.images && review.images.length > 0 ? (
                          <div className="flex gap-1.5">
                            {review.images.slice(0, 3).map((img, i) => (
                              <div
                                key={i}
                                className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex-shrink-0"
                              >
                                <Image
                                  src={img.file_url}
                                  alt={`Photo ${i + 1}`}
                                  fill
                                  className="object-cover"
                                />
                                {/* 사진이 4장 이상이면 '+개수'를 마지막 사진 위에 덮어씌웁니다. */}
                                {i === 2 && review.images.length > 3 && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-bold text-white">
                                    +{review.images.length - 2}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div />
                        )}

                        {/* 사진이 있을 때만 표시되는 뱃지 */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800/50 px-2.5 py-1 rounded-full">
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

        {/* (4) 빈 상태 (Empty State): 작성한 리뷰가 없을 때 표시됩니다. */}
        {/* Empty State */}
        {!loading && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6 relative group">
              <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 relative z-10 transition-colors duration-300 group-hover:text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              작성한 리뷰가 없습니다
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs px-4">
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
  )
}
