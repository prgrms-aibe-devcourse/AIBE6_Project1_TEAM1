import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 미들웨어(Middleware)는 사용자가 어떤 페이지에 접속하기 전에 '가장 먼저' 실행되는 문지기 같은 코드입니다.
export async function middleware(request: NextRequest) {
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

// 아래 설정(config)은 어디로 접속할 때만 미들웨어를 실행할지 결정합니다.
export const config = {
  matcher: [
    /*
     * 이미지, 폰트, css 같은 정적 파일을 요청할 때는 세션을 굳이 검사할 필요가 없으므로 제외합니다.
     * 사실상 사용자가 접근하는 일반적인 브라우저 페이지 주소들에 대해서만 미들웨어가 작동합니다.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
