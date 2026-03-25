import { createBrowserClient } from "@supabase/ssr";

// 브라우저(클라이언트) 환경에서 Supabase에 접근할 때 사용하는 클라이언트를 생성하는 함수입니다.
// 이 함수는 상단에 'use client'가 선언된 클라이언트 컴포넌트(예: GNBMenu)에서 주로 사용됩니다.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
