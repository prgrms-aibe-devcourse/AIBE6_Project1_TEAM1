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

  return { error };
};
