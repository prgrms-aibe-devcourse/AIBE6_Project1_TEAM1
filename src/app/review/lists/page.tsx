import { useModalStore } from "@/store/useModalStore";
import { createClient } from "@/utils/supabase/client";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [reviewList, setReviewList] = useState<>([])
  const { openModal } = useModalStore()

   /** 사용자 정보 가져오기 */
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    getUser()
  }, [])

  useEffect(() => {
    const getReviewList = async () => {
      setLoading(true)
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)

      if (reviewError || !reviewData) {
        setLoading(false)
        console.error(reviewError)
        openModal({
          type: 'alert',
          variant: 'danger',
          title: '리뷰 목록 조회 오류',
          description: '리뷰 목록 조회에 오류가 발생했습니다.',
          onConfirm: () => router.push('/'),
        })
        return
      }

      setReviewList(reviewList)
      setLoading(false)
    }
    if (userId) getReviewList()
  }, [userId])

  const HISTORY_DATA = [
  {
    id: '1',
    title: '부산 영도 흰여울마을 & 감천문화마을',
    date: '2024.03.15',
    imageUrl: '/images/jeju-east.png',

  },]

    const filteredReview = REVIEW_DATA.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );


  return (

    <>
        {/* 3. List Container */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 md:p-10">
            {/* Search Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">리뷰 목록</h2>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full ml-1">
                  {filteredReview.length}
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
              {filteredReview.map((review, index) => (
               
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
    </>
    )
}
              