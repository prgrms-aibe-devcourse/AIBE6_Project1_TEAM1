'use client'

import { createClient } from '@/utils/supabase/client'
import {
  Bookmark,
  CalendarDays,
  Compass,
  Home,
  LogIn,
  LogOut,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const supabase = createClient()

export default function GNBMenu() {
  const [isLogin, setIsLogin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLogin(!!session)
    })

    // 로그인 상태 변화 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLogin(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="flex items-center gap-6 text-gray-700">
      <Link
        href="/"
        className="flex flex-col items-center gap-1 hover:text-black hover:font-medium transition-colors"
      >
        <Home className="w-5 h-5" />
        <span className="text-[11px]">홈</span>
      </Link>
      <Link
        href="/search"
        className="flex flex-col items-center gap-1 hover:text-black hover:font-medium transition-colors"
      >
        <Compass className="w-5 h-5" />
        <span className="text-[11px] font-bold text-black text-center">
          검색
        </span>
      </Link>
      <Link
        href="/plan"
        className="flex flex-col items-center gap-1 hover:text-black hover:font-medium transition-colors"
      >
        <CalendarDays className="w-5 h-5" />
        <span className="text-[11px]">일정</span>
      </Link>
      <Link
        href="/saved"
        className="flex flex-col items-center gap-1 hover:text-black hover:font-medium transition-colors"
      >
        <Bookmark className="w-5 h-5" />
        <span className="text-[11px]">저장</span>
      </Link>

      {isLogin ? (
        <>
          <Link
            href="/mypage"
            className="flex flex-col items-center gap-1 hover:text-black hover:font-medium transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[11px]">마이</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 hover:text-black hover:font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[11px]">로그아웃</span>
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="flex flex-col items-center gap-1 hover:text-black hover:font-medium transition-colors"
        >
          <LogIn className="w-5 h-5" />
          <span className="text-[11px]">로그인</span>
        </Link>
      )}
    </nav>
  )
}
