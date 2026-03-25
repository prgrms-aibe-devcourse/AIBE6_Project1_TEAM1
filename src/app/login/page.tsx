import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

export default function LoginPage() {
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
        {/* 카카오 로그인 */}
        <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#191919] px-4 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90">
          <MessageCircle className="h-5 w-5 fill-white" />
          카카오로 시작하기
        </button>

        {/* 네이버 로그인 */}
        <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-900 transition-colors hover:bg-gray-50 flex-row">
          <div className="flex h-5 w-5 items-center justify-center font-bold text-[#03C75A]">N</div> {/* 임시 네이버 로고 */}
          네이버로 시작하기
        </button>

        {/* 이메일 로그인 */}
        <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-900 transition-colors hover:bg-gray-50">
          <Mail className="h-5 w-5" />
          이메일로 로그인
        </button>
      </div>

      {/* 3. 소셜 로그인 (애플, 구글) 영역 */}
      <div className="mt-8 flex w-full max-w-[340px] flex-col items-center">
        <div className="relative mb-6 flex w-full items-center justify-center">
          <div className="absolute w-full border-t border-gray-100"></div>
          <span className="relative bg-white px-4 text-[13px] text-gray-400">또는</span>
        </div>

        <div className="flex gap-6">
          {/* 애플 로고 */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="h-5 w-5 fill-current text-gray-800">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
            </div>
            <span className="text-[11px] font-medium text-gray-500">Apple</span>
          </div>

          {/* 구글 로고 */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-[18px] w-[18px] fill-current text-gray-700">
                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
            </div>
            <span className="text-[11px] font-medium text-gray-500">Google</span>
          </div>
        </div>
      </div>

      {/* 4. 푸터 링크 영역 */}
      <div className="mt-14 flex flex-col items-center gap-6 text-center">
        <Link href="/" className="text-[13px] font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900">
          로그인 없이 둘러보기
        </Link>
        <p className="text-[11px] text-gray-400">
          로그인 시 <span className="underline cursor-pointer hover:text-gray-600">이용약관</span> 및 <span className="underline cursor-pointer hover:text-gray-600">개인정보처리방침</span>에 동의합니다.
        </p>
      </div>
    </div>
  );
}
