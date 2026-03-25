import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 사용자가 사이트 내에서 이리저리 페이지를 이동할 때마다 인증 상태(세션)를 연장해주는 함수입니다.
export async function updateSession(request: NextRequest) {
  // 사용자의 원본 요청(Request)을 가로채서 다음으로 그대로 넘길 준비를 합니다.
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 기존 쿠키 읽기
        getAll() {
          return request.cookies.getAll();
        },
        // 갱신된 쿠키를 사용자 브라우저 응답(Response)에 다시 구워주기
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 이 코드를 실행하는 순간, Supabase가 "어? 토큰 유효기간이 다 되어가네?" 하면
  // 자동으로 토큰을 최신화(연장)하고 위에서 설정한 setAll 을 통해 새 쿠키를 브라우저에 구워줍니다.
  await supabase.auth.getUser();

  return supabaseResponse;
}
