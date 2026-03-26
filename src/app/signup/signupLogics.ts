import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const handleEmailSignUp = async (email: string, password: string, nickname: string): Promise<{error: Error | null}> => {
  // 기본 프로필 이미지 주소 (수정 필요 시 변경 가능)
  const defaultProfile = "/icon.svg"; 

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        nickname: nickname,
        avatar_url: defaultProfile,
      }
    }
  });

  if (!error && data?.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      nickname: nickname,
      avatar_url: defaultProfile,
      email: email,
      created_at: new Date().toISOString()
    });
    
    if (profileError) {
      console.error('Profile table insert error:', profileError);
      // 필요한 경우 에러 처리를 추가할 수 있습니다.
    }
  }

  return { error };
};
