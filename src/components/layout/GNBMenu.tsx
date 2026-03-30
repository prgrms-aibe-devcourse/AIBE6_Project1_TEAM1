'use client'

import { createClient } from '@/utils/supabase/client'
import {
  CalendarDays,
  Compass,
  Home,
  LogIn,
  LogOut,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function GNBMenu() {
  const supabase = useMemo(() => createClient(), [])
  const [isLogin, setIsLogin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

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

  const getMenuClass = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return `flex flex-col items-center gap-1 transition-all duration-200 ${
      isActive 
        ? 'text-purple-600 font-bold dark:text-purple-400' 
        : 'text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400'
    }`;
  }

  return (
    <nav className="flex items-center gap-6">
      <Link href="/" className={getMenuClass('/')}>
        <Home className="w-5 h-5" />
        <span className="text-[11px]">홈</span>
      </Link>
      <Link href="/search" className={getMenuClass('/search')}>
        <Compass className="w-5 h-5" />
        <span className="text-[11px]">검색</span>
      </Link>
      <Link href="/plan" className={getMenuClass('/plan')}>
        <CalendarDays className="w-5 h-5" />
        <span className="text-[11px]">일정</span>
      </Link>

      {isLogin ? (
        <>
          <Link href="/mypage" className={getMenuClass('/mypage')}>
            <User className="w-5 h-5" />
            <span className="text-[11px]">마이</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[11px]">로그아웃</span>
          </button>
        </>
      ) : (
        <Link href="/login" className={getMenuClass('/login')}>
          <LogIn className="w-5 h-5" />
          <span className="text-[11px]">로그인</span>
        </Link>
      )}
    </nav>
  )
}
