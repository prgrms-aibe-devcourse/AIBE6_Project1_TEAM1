"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthErrorMessage } from "@/utils/supabase/authErrors";
import { handleEmailSignUp } from "./signupLogics";
import { useModalStore } from "@/store/useModalStore";

export default function SignUpPage() {
  const router = useRouter();
  const { openModal } = useModalStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !nickname) {
      setErrorMsg("모든 항목을 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("비밀번호는 6자리 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    const { error } = await handleEmailSignUp(email, password, nickname);
    setIsLoading(false);

    if (error) {
      setErrorMsg(getAuthErrorMessage(error));
    } else {
      openModal({
        type: "alert",
        variant: "primary",
        title: "가입 완료 🎉",
        description: "성공적으로 회원가입 되었습니다.\n입력하신 이메일로 발송된 인증 메일을 확인해 주세요.\n확인 버튼을 누르면 로그인 페이지로 이동합니다.",
        onConfirm: () => router.push("/login"),
        onCloseCallback: () => router.push("/login"),
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      {/* 1. 로고 및 타이틀 영역 */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-4 h-14 w-14">
          <Image src="/icon.svg" alt="뚜벅 로고" fill className="object-contain" />
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">회원가입</h1>
        <p className="text-sm font-medium text-gray-400">뚜벅이의 새로운 여행 메이트가 되어주세요</p>
      </div>

      {/* 2. 회원가입 폼 영역 */}
      <div className="flex w-full max-w-[340px] flex-col gap-3">
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              required
            />
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              required
            />
            <input
              type="password"
              placeholder="비밀번호(6자리 이상)를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
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
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            가입하기
          </button>
        </form>

        <div className="mt-4 flex w-full items-center justify-center">
          <Link href="/login" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors">
            이미 계정이 있으신가요? 로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
