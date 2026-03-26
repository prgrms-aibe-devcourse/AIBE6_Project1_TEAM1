import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// 구글 등 소셜 로그인 완료 후, 구글 로그인 창에서 우리 서비스로 돌아올 때 자동으로 방문하는 'API 라우트' 입니다.
// URL 주소가 /auth/callback?code=12345 형태일 때 여기로 도착합니다.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  // URL 주소창에서 인증용 일회성 'code' 값을 뽑아냅니다.
  const code = searchParams.get('code')
  // 로그인이 완료된 후 최종적으로 이동할 주소를 뽑아냅니다. 기본값은 메인 홈페이지('/') 입니다.
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // 서버용 Supabase 클라이언트를 가져옵니다 (쿠키 설정이 가능한 클라이언트)
    const supabase = await createClient()
    
    // 가져온 일회성 'code'를 Supabase에 던져주고, 대신 진짜 '세션(로그인 쿠키)'으로 교환합니다.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // 에러없이 세션 교환에 성공했다면? 우리가 원래 가려던 최종 페이지로 보내줍니다.
    if (!error && data.user) {
      const { user } = data
      // profile 테이블에 이미 해당 유저 정보가 있는지 확인
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      // 없다면 새로 가입한 유저이므로 profile 테이블에 insert
      if (!existingProfile) {
        const metadata = user.user_metadata || {}
        // 구글, 카카오 등의 메타데이터에서 이름과 프로필 사진을 가져옵니다.
        const nickname = metadata.name || metadata.full_name || `user_${user.id.substring(0, 8)}`
        const avatar_url = metadata.avatar_url || metadata.picture || ''
        
        await supabase.from('profiles').insert({
          id: user.id,
          nickname: nickname,
          avatar_url: avatar_url,
          email: user.email || '',
          // created_at은 DB 기본값이 설정되어 있다면 생략 가능하지만, 요청하신 컬럼 형태에 맞게 넣습니다.
          created_at: new Date().toISOString()
        }).then(() => {
          console.log('User profile created successfully');
        })
          

        
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 일회성 코드가 아예 없거나 에러가 났다면 로그인 페이지로 돌려보냅니다.
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
