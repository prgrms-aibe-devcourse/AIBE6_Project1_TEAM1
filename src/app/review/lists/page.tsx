'use client'

import { deleteReview } from '@/components/domain/review/useDeleteReview'
import { useModalStore } from '@/store/useModalStore'
import { createClient } from '@/utils/supabase/client'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  Edit2,
  Image as ImageIcon,
  MessageSquare,
  MoreVertical,
  Star,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Dummy data for user reviews
const REVIEWS_DATA = [
  {
    id: '106',
    courseId: 'c1',
    courseName: '영도 흰여울문화마을 산책 코스',
    courseImage: '/images/jeju-east.png',
    rating: 5,
    content:
      '바다를 보면서 걷는 기분이 정말 최고였어요! 골목골목 숨겨진 카페들도 너무 예쁘고, 사진 찍기 너무 좋은 곳입니다. 노을 질 때쯤 가는 걸 강력 추천드려요.',
    date: '2024.03.25',
    likes: 12,
    images: ['/images/jeju-east.png', '/images/jeju-east.png'],
  },
  {
    id: '2',
    courseId: 'c2',
    courseName: '서울 숲 힐링 산책로',
    courseImage: '/images/jeju-east.png',
    rating: 4,
    content:
      '도심 속에서 자연을 느낄 수 있는 최고의 장소입니다. 다만 주말에는 사람이 조금 많아서 평일 오전에 방문하는 것이 더 여유로울 것 같아요.',
    date: '2024.03.20',
    likes: 8,
    images: [],
  },
  {
    id: '3',
    courseId: 'c3',
    courseName: '광화문 역사 밤거리 걷기',
    courseImage: '/images/jeju-east.png',
    rating: 5,
    content:
      '야경이 정말 아름다워요. 경복궁 주변을 돌며 역사의 숨결을 느낄 수 있었습니다. 외국인 친구와 함께 왔는데 너무 좋아하네요.',
    date: '2024.03.15',
    likes: 24,
    images: ['/images/jeju-east.png'],
  },
]

const STATS = [
  {
    label: '전체 리뷰',
    value: '12',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    label: '평균 별점',
    value: '4.8',
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    label: '도움됨',
    value: '44',
    icon: ThumbsUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
]

export default function ReviewsPage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()
  const { openModal } = useModalStore()

  const handleEdit = (reviewId: string) => {
    console.log(reviewId)
    router.push(`/review/edit?reviewId=${reviewId}`)
  }

  const handleDelete = async (reviewId: string) => {
    if (!reviewId) return
    await deleteReview(supabase, Number(reviewId), openModal, router)
  }

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
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              작성한 리뷰
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* 2. Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white shadow-sm border border-gray-100"
              >
                <div
                  className={`mb-4 p-3 rounded-2xl ${stat.bgColor} ${stat.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-tight">
                    {stat.label}
                  </span>
                  <span className="text-3xl font-extrabold text-gray-900">
                    {stat.value}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 3. Review List Container */}
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {REVIEWS_DATA.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                {/* Review Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-gray-100 flex-shrink-0">
                    <Image
                      src={review.courseImage}
                      alt={review.courseName}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate pr-8">
                        {review.courseName}
                      </h3>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === review.id ? null : review.id,
                            )
                          }
                          className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {activeMenu === review.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-10">
                            <button
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => handleEdit(review.id)}
                            >
                              <Edit2 className="h-4 w-4" /> 수정하기
                            </button>
                            <button
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              onClick={() =>
                                openModal({
                                  type: 'confirm',
                                  variant: 'danger',
                                  title: '리뷰를 삭제하시겠습니까?',
                                  description:
                                    '삭제된 데이터는 복구할 수 없습니다.',
                                  confirmText: '삭제',
                                  cancelText: '취소',
                                  onConfirm: () => handleDelete(review.id),
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" /> 삭제하기
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-400">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="mb-6">
                  <p className="text-[15px] leading-relaxed text-gray-600 whitespace-pre-wrap">
                    {review.content}
                  </p>
                </div>

                {/* Photo Gallery */}
                {review.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
                    {review.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative h-32 w-32 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0"
                      >
                        <Image
                          src={img}
                          alt={`Review photo ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      도움됨 {review.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      댓글 2
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                    <ImageIcon className="h-3 w-3" />+{review.images.length}{' '}
                    Photos
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State Mockup */}
        {REVIEWS_DATA.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-gray-100 p-8 rounded-full mb-6">
              <MessageSquare className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              작성한 리뷰가 없습니다
            </h3>
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
  )
}
