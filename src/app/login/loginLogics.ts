import { createClient } from "@/utils/supabase/client";
import { useModalStore } from "@/store/useModalStore";

// 브라우저 화면에서 동작하는 함수들이므로, 클라이언트용 Supabase를 가져옵니다.
const supabase = createClient();

/**
 * 소셜 로그인(구글, 카카오)을 처리하는 함수입니다.
 * @param provider 로그인 제공자 ('google' 또는 'kakao')
 */
export const handleSocialLogin = async (provider: 'google' | 'kakao') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      // 로그인을 무사히 마치면, /auth/callback 경로로 사용자를 리다이렉트합니다.
      // 여기서 일회성 코드를 세션으로 교환합니다.
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('로그인 에러:', error)
    useModalStore.getState().openModal({
      type: 'alert',
      variant: 'danger',
      title: '로그인 실패',
      description: '로그인 중 오류가 발생했습니다.',
    })
    return
  }
}

/**
 * 이메일과 비밀번호를 사용하여 로그인을 처리하는 함수입니다.
 * @param email 사용자 이메일
 * @param password 사용자 비밀번호
 * @returns 에러 객체를 포함한 프로미스
 */
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

/**
 * 비밀번호 재설정 이메일을 발송하는 함수입니다.
 * @param email 비밀번호를 재설정할 사용자의 이메일 주소
 * @returns 에러 객체를 포함한 프로미스
 */
export const handleResetPassword = async (email: string): Promise<{error: Error | null}> => {
  // Supabase Auth의 resetPasswordForEmail 메서드를 사용하여 재설정 링크가 담긴 메일을 보냅니다.
  // redirectTo 옵션에 지정된 경로는 사용자가 메일의 링크를 클릭했을 때 돌아올 주소입니다.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/login/update-password`,
  });

  if (error) {
    console.error('Reset Password Error:', error.message, error);
  }

  return { error };
};

/**
 * 로그인된 상태에서 사용자의 비밀번호를 새로운 값으로 업데이트하는 함수입니다.
 * @param password 새롭게 설정할 비밀번호
 * @returns 에러 객체를 포함한 프로미스
 */
export const handleUpdatePassword = async (password: string): Promise<{error: Error | null}> => {
  // Supabase Auth의 updateUser 메서드를 사용하여 비밀번호를 업데이트합니다.
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error('Update Password Error:', error.message, error);
  }

  return { error };
};