import { createAdminClient, createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * 회원 탈퇴 요청을 처리하는 API 핸들러입니다.
 */
export async function POST() {
  const supabase = await createClient();
  const adminSupabase = await createAdminClient();

  // 1. 현재 로그인한 사용자의 정보를 가져옵니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  try {
    // 2. 사용자의 프로필 데이터를 삭제합니다. (RLS가 걸려있어도 어드민 클라이언트는 무시합니다)
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) throw profileError;

    // 3. (옵션) 사용자가 올린 이미지 파일을 스토리지에서 삭제하는 로직을 추가할 수 있습니다.
    // 여기서는 단순함을 위해 생략하거나 기본 프로필 정보만 처리합니다.

    // 4. Supabase Auth에서 유저 계정을 완전히 삭제합니다. (어드민 권한 전용)
    const { error: authError } = await adminSupabase.auth.admin.deleteUser(
      user.id
    );

    if (authError) throw authError;

    // 5. 성공 응답 반환
    return NextResponse.json({ message: "성공적으로 탈퇴되었습니다." });
  } catch (error: any) {
    console.error("회원 탈퇴 처리 중 오류:", error);
    return NextResponse.json(
      { error: error.message || "탈퇴 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
