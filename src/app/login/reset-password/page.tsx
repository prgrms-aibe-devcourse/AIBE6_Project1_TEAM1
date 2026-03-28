"use client";

import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { handleResetPassword } from "../loginLogics";
import { getAuthErrorMessage } from "@/utils/supabase/authErrors";

/**
 * 비밀번호 재설정(찾기) 요청 페이지 컴포넌트입니다.
 * 사용자가 이메일을 입력하면 비밀번호 재설정 링크를 발송합니다.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // 입력받은 이메일 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [errorMsg, setErrorMsg] = useState(""); // 에러 메시지 상태
  const [isSent, setIsSent] = useState(false); // 메일 발송 완료 여부

  // 폼 제출 핸들러
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("이메일을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    
    // loginLogics.ts에 정의된 handleResetPassword 함수 호출
    const { error } = await handleResetPassword(email);
    setIsLoading(false);

    if (error) {
      // 에러 발생 시 유틸리티 함수를 통해 사용자 친화적인 메시지로 변환
      setErrorMsg(getAuthErrorMessage(error));
    } else {
      // 성공 시 성공 화면으로 전환
      setIsSent(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      {/* 1. 상단 로고 및 제목 */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-4 h-14 w-14">
          <Image src="/icon.svg" alt="뚜벅 로고" fill className="object-contain" />
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">비밀번호 찾기</h1>
        <p className="text-sm font-medium text-gray-400">가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.</p>
      </div>

      <div className="flex w-full max-w-[340px] flex-col gap-3">
        {isSent ? (
          // 메일 발송 완료 화면
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <Mail className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">인증 메일이 발송되었습니다!</p>
              <p className="mt-2 text-sm text-gray-500">
                {email} 주소로 보낸 메일의 <br />
                링크를 클릭하여 비밀번호를 재설정해 주세요.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              로그인 화면으로 돌아가기
            </button>
          </div>
        ) : (
          // 이메일 입력 폼 화면
          <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-2 flex w-fit items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </button>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="가입하신 이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                required
              />
            </div>

            {errorMsg && <p className="text-sm text-red-500 font-medium">{errorMsg}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              비밀번호 재설정 메일 보내기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
