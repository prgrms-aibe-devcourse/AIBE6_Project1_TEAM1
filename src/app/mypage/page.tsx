import MenuList from '@/components/domain/my-page/MenuList'
import ProfileHeader from '@/components/domain/my-page/ProfileHeader'
import StatCardGroup from '@/components/domain/my-page/StatCardGroup'
import { createClient } from '@/utils/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let stats = { triplogCount: 0, totalDistance: 0, reviewCount: 0 }

  if (user) {
    // 1. 프로필 정보 가져오기
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = profileData

    // 2. 여행 기록 통계 가져오기 (travelers!inner 조인하여 'completed'만 합산)
    // TriplogsPage와 동일한 로직을 적용하여 데이터 일관성을 유지합니다.
    const { data: tripsData } = await supabase
      .from('trips')
      .select('id, total_distance, travelers!inner(status, user_id)')
      .eq('travelers.user_id', user.id)
      .eq('travelers.status', 'completed')
    
    if (tripsData) {
      stats.triplogCount = tripsData.length
      stats.totalDistance = tripsData.reduce((acc, trip) => acc + (trip.total_distance || 0), 0)

      // 3. 리뷰 통계 가져오기 (이 완료된 여행들에 대해 작성된 리뷰들)
      if (tripsData.length > 0) {
        const tripIds = tripsData.map(t => t.id)
        const { count: reviewCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .in('trip_id', tripIds)
          .eq('user_id', user.id)
        
        stats.reviewCount = reviewCount || 0
      }
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 dark:bg-gray-950 md:dark:bg-gray-950 pb-20">
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-10 flex flex-col">
        <ProfileHeader
          nickname={profile?.nickname}
          avatar_url={profile?.avatar_url}
          triplogCount={stats.triplogCount}
        />
        <StatCardGroup 
          triplogCount={stats.triplogCount}
          totalDistance={Number(stats.totalDistance.toFixed(1))}
          reviewCount={stats.reviewCount}
        />
        <div className="mt-8 md:mt-10">
          <MenuList />
        </div>
        <div className="mt-12 flex justify-center pb-8">
          <button className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors border-b border-transparent hover:border-gray-600 pb-0.5">
            로그아웃
          </button>
        </div>
      </main>
    </div>
  )
}
