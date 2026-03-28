"use client";

import { useModalStore } from "@/store/useModalStore";
import { getAuthErrorMessage } from "@/utils/supabase/authErrors";
import { Loader2, Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { handleUpdatePassword } from "../loginLogics";

/**
 * 비밀번호 업데이트(변경) 페이지 컴포넌트입니다.
 * 비밀번호 재설정 이메일을 통해 들어온 사용자가 새로운 비밀번호를 설정하는 곳입니다.
 */
export default function UpdatePasswordPage() {
  const router = useRouter();
  const { openModal } = useModalStore();  
  const [password, setPassword] = useState(""); // 새 비밀번호 상태
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [errorMsg, setErrorMsg] = useState(""); // 에러 메시지 상태

  // 폼 제출 핸들러
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 최소 길이 등 간단한 유효성 검사 (필요에 따라 강화 가능)
    if (password.length < 6) {
      setErrorMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    
    // loginLogics.ts에 정의된 handleUpdatePassword 함수 호출
    // 이 시점에서 사용자는 복구 링크를 통해 한시적으로 세션이 인증된 상태여야 합니다.
    const { error } = await handleUpdatePassword(password);
    setIsLoading(false);

    if (error) {
      setErrorMsg(getAuthErrorMessage(error));
    } else {
      // 변경 성공 시 메인 페이지로 이동 (완전히 로그인된 상태)
      openModal({
        type: 'alert',
        variant: 'primary',
        title: '비밀번호 변경 성공',
        description: '비밀번호가 성공적으로 변경되었습니다.',
        confirmText: '확인',
        onConfirm: () => {
          router.push("/");
        },
      })
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      {/* 1. 상단 로고 및 제목 */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-4 h-14 w-14">
          <Image src="/icon.svg" alt="뚜벅 로고" fill className="object-contain" />
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">새 비밀번호 설정</h1>
        <p className="text-sm font-medium text-gray-400">새로운 비밀번호를 입력해 주세요.</p>
      </div>

      <div className="flex w-full max-w-[340px] flex-col gap-3">
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="새 비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              required
            />
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            비밀번호 변경하기
          </button>
        </form>
      </div>
    </div>
  );
}
