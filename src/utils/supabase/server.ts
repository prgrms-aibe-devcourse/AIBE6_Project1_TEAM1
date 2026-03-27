import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버 컴포넌트나 API 라우트 같은 "서버 환경"에서 Supabase에 접근할 때 사용하는 함수입니다.
// 서버에서는 "우리가 방금 보낸 요청이 로그인된 사용자의 요청인지" 알기 위해 쿠키(Cookie)를 확인해야 합니다.
export async function createClient() {
  // Next.js의 기능을 이용해 사용자의 브라우저 쿠키 저장소에 접근합니다.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 1. 쿠키 전부 가져오기 (이 쿠키를 보고 로그인 여부를 판단합니다)
        getAll() {
          return cookieStore.getAll();
        },
        // 2. 쿠키 새로 설정하기 (로그인을 하거나 세션을 갱신할 때 새 쿠키를 굽습니다)
        setAll(cookiesToSet) {
          try {
            // 새로 설정해야 할 쿠키들을 브라우저에 구워줍니다.
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 간혹 서버 컴포넌트 환경에서는 응답을 이미 다 보낸 후에 쿠키를 설정하려고 해서 에러가 날 때가 있습니다.
            // 하지만 미들웨어(middleware.ts)가 미리 알아서 세션 갱신을 해주기 때문에 이 에러는 무시해도 괜찮습니다.
          }
        },
      },
    }
  );
}
// 어드민 전용 고유 키(Service Role Key)를 사용하여, 보안 제약을 넘어서는 작업을 할 때 사용합니다.
// 예: 회원 탈퇴 시 auth.users에서 사용자 직접 삭제
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!, // 사용자 요청에 따라 .env의 secretkey(SUPABASE_SECRET_KEY)를 사용합니다.
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // 어드민 클라이언트는 보통 쿠키를 설정할 일이 없습니다.
        },
      },
    }
  );
}
