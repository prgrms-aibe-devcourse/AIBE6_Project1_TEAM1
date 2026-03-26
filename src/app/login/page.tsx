"use client";

import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleSocialLogin, handleEmailLogin } from "./loginLogics";

export default function LoginPage() {
  const router = useRouter();
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    const { error } = await handleEmailLogin(email, password);
    setIsLoading(false);

    if (error) {
      setErrorMsg("이메일 또는 비밀번호가 일치하지 않습니다.");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      {/* 1. 로고 및 타이틀 영역 */}
      <div className="mb-10 flex flex-col items-center text-center">
        {/* 로고 아이콘 */}
        <div className="relative mb-4 h-14 w-14">
          <Image src="/icon.svg" alt="뚜벅 로고" fill className="object-contain" />
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">뚜벅</h1>
        <p className="text-sm font-medium text-gray-400">뚜벅이 여행자를 위한 스마트 여행 플래너</p>
      </div>

      {/* 2. 로그인 버튼 목록 영역 */}
      <div className="flex w-full max-w-[340px] flex-col gap-3">
        {isEmailMode ? (
          <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
            <button
              type="button"
              onClick={() => setIsEmailMode(false)}
              className="mb-2 flex w-fit items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              돌아가기
            </button>
            <div className="flex flex-col gap-3">
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
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              로그인
            </button>
          </form>
        ) : (
          <>
            {/* 카카오 로그인 */}
            <button 
              onClick={() => handleSocialLogin('kakao')}
              className="flex w-full items-center justify-center transition-opacity hover:opacity-90 active:opacity-80">
              <Image 
                src="/Auth/kakao/kakao_login_large_wide.png" 
                alt="카카오로 시작하기" 
                width={340} 
                height={50} 
                className="w-full h-auto"
                priority /* 첫 화면의 주요 버튼이므로 바로 로드 */
              />
            </button>

            {/* 구글 로그인 */}
            <button 
              onClick={() => handleSocialLogin('google')}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-5 w-5 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-[18px] w-[18px] fill-current text-gray-700">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                </svg>
              </div>
              <span>Google로 시작하기</span>
            </button>

            {/* 구분선 */}
            <div className="relative my-2 flex w-full items-center justify-center">
              <div className="absolute w-full border-t border-gray-100"></div>
              <span className="relative bg-white px-4 text-[13px] text-gray-400">또는</span>
            </div>

            {/* 이메일 로그인 */}
            <button 
              onClick={() => setIsEmailMode(true)}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              <Mail className="h-5 w-5" />
              <span>이메일로 로그인</span>
            </button>
          </>
        )}
      </div>

      {/* 4. 푸터 링크 영역 */}
      <div className="mt-14 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-4">
          <Link href="/signup" className="text-[13px] font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900">
            이메일 회원가입
          </Link>
          <span className="text-gray-300 text-[11px]">|</span>
          <Link href="/" className="text-[13px] font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900">
            로그인 없이 둘러보기
          </Link>
        </div>
        <p className="text-[11px] text-gray-400">
          로그인 시 <span className="underline cursor-pointer hover:text-gray-600">이용약관</span> 및 <span className="underline cursor-pointer hover:text-gray-600">개인정보처리방침</span>에 동의합니다.
        </p>
      </div>
    </div>
  );
}
