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

  // 세션 정보(사용자 정보)를 가져옵니다. 
  const { data: { user } } = await supabase.auth.getUser();

  // --- 보호된 경로 처리 (로그인이 필요한 페이지들) ---
  const protectedPaths = ["/mypage", "/plan", "/review"];
  const isProtectedPath = protectedPaths.some((path) => 
    request.nextUrl.pathname.startsWith(path)
  );

  // 만약 보호된 경로에 접근 중인데 유저 정보가 없다면? 로그인 페이지로 보냅니다.
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
