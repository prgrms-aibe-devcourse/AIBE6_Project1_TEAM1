import LevelProgressBar from '@/components/domain/my-page/LevelProgressBar'
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

    // 2. 여행 기록 통계 가져오기
    const { data: tripsData } = await supabase
      .from('trips')
      .select('total_distance')
      .eq('user_id', user.id)
    
    if (tripsData) {
      stats.triplogCount = tripsData.length
      stats.totalDistance = tripsData.reduce((acc, trip) => acc + (trip.total_distance || 0), 0)
    }

    // 3. 리뷰 통계 가져오기
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    stats.reviewCount = reviewCount || 0
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 pb-20">
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-10 flex flex-col">
        <ProfileHeader
          nickname={profile?.nickname}
          avatar_url={profile?.avatar_url}
        />
        <StatCardGroup 
          triplogCount={stats.triplogCount}
          totalDistance={Number(stats.totalDistance.toFixed(1))}
          reviewCount={stats.reviewCount}
        />
        <div className="mt-8 md:mt-10">
          <MenuList />
          <LevelProgressBar />
        </div>
      </main>
    </div>
  )
}
