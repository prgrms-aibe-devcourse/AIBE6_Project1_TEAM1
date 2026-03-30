import { createBrowserClient } from "@supabase/ssr";

// 브라우저(클라이언트) 환경에서 Supabase에 접근할 때 사용하는 클라이언트를 생성하는 함수입니다.
// 이 함수는 상단에 'use client'가 선언된 클라이언트 컴포넌트(예: GNBMenu)에서 주로 사용됩니다.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    // 빌드 시점(Pre-rendering)에 환경 변수가 없을 경우 에러가 발생하지 않도록 빈 값으로 초기화하거나
    // 실제 클라이언트 사용 시점에 에러를 던지도록 안전하게 처리합니다.
    return createBrowserClient("", "");
  }

  return createBrowserClient(url, key);
}
