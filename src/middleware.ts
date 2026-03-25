import { updateSession } from "@/utils/supabase/middleware";
import { type NextRequest } from "next/server";

// 미들웨어(Middleware)는 사용자가 어떤 페이지에 접속하기 전에 '가장 먼저' 실행되는 문지기 같은 코드입니다.
export async function middleware(request: NextRequest) {
  // 사용자가 이동할 때마다 쿠키를 확인하고 갱신하는 함수를 호출하여 로그인이 안 풀리게 유지해줍니다.
  return await updateSession(request);
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
