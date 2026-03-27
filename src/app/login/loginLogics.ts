import { createClient } from "@/utils/supabase/client";

// 브라우저 화면에서 동작하는 함수들이므로, 클라이언트용 Supabase를 가져옵니다.
const supabase = createClient();

export const handleSocialLogin = async (provider: 'google' | 'kakao') => {
  // 구글 소셜 로그인 창을 띄우는 함수입니다.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      // 로그인을 무사히 마치면, 구글이 우리 사이트의 어느 주소로 사용자를 돌려보낼지 정합니다.
      // 방금 우리가 만든 /auth/callback 경로로 보내서 일회성 코드를 로그인 세션(쿠키)으로 교환하게 만듭니다.
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline', // 구글 토큰 만료 시 재발급 받을 수 있게 권한 추가
        prompt: 'consent', // 항상 사용자로부터 구글 로그인 권한 동의창을 띄우게 설정
      },
    },
  })

  if (error) {
    console.error('로그인 에러:', error)
    alert('로그인 중 오류가 발생했습니다.')
    return
  }
}

// 이메일 로그인 처리 함수
export const handleEmailLogin = async (email: string, password: string): Promise<{error: Error | null}> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Email Login Error:', error.message, error);
  } else {
    console.log('Email Login Success:', data.user?.email);
  }

  return { error };
};