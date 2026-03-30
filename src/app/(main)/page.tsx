'use client' // 클라이언트 컴포넌트로 선언 (React Hook 및 브라우저 API 사용을 위해 필요)

import { createClient } from '@/utils/supabase/client'
import {
  motion,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
} from 'framer-motion'
import { ArrowRight, Download, Map, MessageSquare, Sparkles, Users } from 'lucide-react'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

//이미지 관련
import feature1 from '@public/images/intro/feature1.png'
import feature2 from '@public/images/intro/feature2.png'
import hero from '@public/images/intro/hero.png'
import Image from 'next/image'

// --- 개별 컴포넌트 정의 ---

/**
 * AnimatedCounter: 숫자가 가파르게 올라가는 효과를 주는 컴포넌트
 * @param value: 최종 목표 숫자
 * @param suffix: 숫자 뒤에 붙는 단위 (예: '만 명')
 * @param duration: 애니메이션이 지속되는 시간 (초)
 */
const AnimatedCounter = ({
  value,
  suffix = '',
  duration = 2,
}: {
  value: number
  suffix?: string
  duration?: number
}) => {
  const [count, setCount] = useState(0) // 현재 화면에 보여줄 숫자 상태
  const ref = useRef(null) // 요소가 화면에 보이는지 감지하기 위한 참조
  const isInView = useInView(ref, { once: true }) // 화면에 한 번이라도 들어오면 true가 됨

  useEffect(() => {
    if (isInView) {
      // 화면에 보일 때만 애니메이션 시작
      let start = 0
      const end = value
      const totalMiliseconds = duration * 1000
      const incrementTime = totalMiliseconds / end // 숫자가 올라가는 간격 계산

      const timer = setInterval(() => {
        start += 1
        setCount(start)
        if (start === end) clearInterval(timer) // 목표 숫자에 도달하면 멈춤
      }, incrementTime)

      return () => clearInterval(timer) // 컴포넌트가 사라지면 타이머 정리
    }
  }, [isInView, value, duration])

  return (
    <span ref={ref} className="text-4xl font-bold text-gray-900 md:text-5xl">
      {count.toLocaleString()} {/* 숫자에 콤마(,) 표시 추가 */}
      {suffix}
    </span>
  )
}

/**
 * ScrollReveal: 스크롤 시 요소가 부드럽게 나타나도록 하는 래퍼 컴포넌트
 * @param children: 애니메이션을 적용할 내부 요소
 * @param direction: 요소가 나타날 방향 (up, down, left, right)
 */
const ScrollReveal = ({
  children,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}) => {
  const controls = useAnimation() // 애니메이션 제어 객체
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 }) // 요소의 30%가 보이면 감지

  useEffect(() => {
    if (isInView) {
      controls.start('visible') // 화면에 보이면 'visible' 애니메이션 실행
    }
  }, [controls, isInView])

  // 애니메이션 상태 정의
  const variants = {
    hidden: {
      // 시작 상태 (투명하고 위치가 어긋나 있음)
      opacity: 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
    },
    visible: {
      // 최종 상태 (불투명하고 원래 위치로 이동)
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.8, ease: 'easeOut' as any }, // 부드럽게 감속하는 효과
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden" // 처음에는 숨김 상태
      animate={controls} // 제어 객체에 따라 애니메이션 실행
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// --- 메인 페이지 컴포넌트 ---

export default function Main() {
  const supabase = createClient() // 수파베이스 클라이언트 호출
  const { scrollY } = useScroll() // 브라우저 전체 스크롤 위치 감지

  // 스크롤 위치(0~300px)에 따라 히어로 섹션의 투명도와 크기 조절
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]) // 내려갈수록 투명해짐
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]) // 내려갈수록 살짝 커짐

  const router = useRouter()

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      // 로그인 사용자 정보 확인용 (필요 시 활용)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <div className="w-full overflow-hidden bg-white selection:bg-purple-100 selection:text-purple-900">
      {/* 1. 히어로 섹션 (Hero Section): 페이지 최상단, 강렬한 인상을 주는 구역 */}
      <section className="relative flex h-[90vh] min-h-[600px] w-full items-center justify-center pt-16">
        {/* 배경 이미지 및 효과 */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0 h-full w-full"
        >
          {/* 어두운 그라데이션 오버레이로 텍스트 가독성 확보 */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
          <Image
            src={hero}
            alt="도시의 아름다운 배경"
            fill
            className="object-cover"
            priority // 페이지 로드 시 가장 먼저 불러오도록 설정
          />
        </motion.div>

        {/* 히어로 중앙 텍스트 컨텐츠 */}
        <div className="relative z-20 flex max-w-5xl flex-col items-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} // 밑에서 위로 올라오며 페이드인
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
              더 똑똑한 여행의 시작, 뚜벅
            </span>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl">
              어디로 떠날지 <br />
              <span className="text-purple-300">고민하지 마세요.</span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
              '뚜벅'과 함께라면 차가 없는 여행 계획도 즐거워집니다. <br />
              실제 뚜벅이 여행가들이 검증한 마을과 도시의 코스로 나만의 완벽한
              여행을 완성하세요.
            </p>
            {/* 버튼들 */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push('/plan')}
                className="group flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-500/30"
              >
                일정 만들기 시작
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => router.push('/search')}
                className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-gray-900 transition-all hover:bg-gray-50"
              >
                인기 여행지 보기
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. 통계 섹션 (Stats Section): 서비스의 규모를 숫자로 보여주며 신뢰 유도 */}
      <section className="bg-gray-50 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
            {/* 사용자 수 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <AnimatedCounter value={120} suffix="만 명" />
              <p className="mt-2 text-gray-500">누적 사용자</p>
            </div>
            {/* 저장된 일정 수 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                <Map className="h-8 w-8 text-blue-500" />
              </div>
              <AnimatedCounter value={450} suffix="만 개" />
              <p className="mt-2 text-gray-500">저장된 여행 일정</p>
            </div>
            {/* 리뷰 수 */}
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                <MessageSquare className="h-8 w-8 text-pink-500" />
              </div>
              <AnimatedCounter value={890} suffix="만 개" />
              <p className="mt-2 text-gray-500">생생한 여행 리뷰</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 기능 소개 섹션 (Feature Sections): 서비스의 핵심 장점 설명 */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          {/* 특징 1: 스마트 일정 짜기 */}
          <div className="mb-32 grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <ScrollReveal direction="right">
              {' '}
              {/* 오른쪽에서 등장 */}
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src={feature1}
                  alt="도시 일정 계획 화면"
                  fill
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left">
              {' '}
              {/* 왼쪽에서 등장 */}
              <div>
                <span className="mb-4 inline-block font-bold text-purple-600 uppercase tracking-widest">
                  Smart Planning
                </span>
                <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                  드래그 앤 드롭으로 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                    손쉽게 짜는 일정
                  </span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  지도를 보며 복잡하게 계산할 필요가 없습니다. <br />
                  가고 싶은 도심 속 장소를 선택만 하세요. 최적의 경로를 '뚜벅'이
                  대신 계산해 드립니다. 동선을 고민하던 시간은 이제 여행을
                  즐기는 시간으로 바뀝니다.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* 특징 2: 리얼 가이드 */}
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">
            <ScrollReveal direction="right" className="order-2 md:order-1">
              <div>
                <span className="mb-4 inline-block font-bold text-blue-600 uppercase tracking-widest">
                  Local Insights
                </span>
                <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
                  진짜 가보고 알게 된 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                    리얼 꿀팁 가이드
                  </span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  홍보용 글에 속지 마세요. <br />
                  실제 다녀온 뚜벅이 여행자들의 생생한 리뷰와 현지인만 아는 숨은
                  명소 정보를 한눈에 확인할 수 있습니다.
                  <br />
                  당신의 추억에 '뚜벅'이 함께 할게요!
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" className="order-1 md:order-2">
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  src={feature2}
                  alt="마을 현지인 경험"
                  fill
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. AI 추천 섹션 (AI Recommendation Section): 뚜벅만의 차별화된 AI 기능 강조 */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[3rem] bg-gray-900 px-8 py-16 md:px-16 md:py-24 overflow-hidden relative group">
            {/* 장식용 배경 효과 */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] group-hover:bg-purple-600/30 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <ScrollReveal direction="right">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-bold text-purple-400 ring-1 ring-purple-500/20 mb-6">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Powered Trip Assistant</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                  어디로 갈지 막막할 땐, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-300 italic">
                    AI 뚜벅이 코스
                  </span>
                </h2>
                <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10">
                  내가 선호하는 여행 스타일, 걷고 싶은 거리, 보고 싶은 풍경만 말해주세요. <br className="hidden md:block" />
                  당신만을 위한 최적의 도심 걷기 코스를 AI가 실시간으로 설계해 드립니다. 
                  <br />
                  복잡한 검색은 멈추고, 추천받은 코스로 바로 떠나보세요!
                </p>
                <button
                  onClick={() => router.push('/ai')}
                  className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30"
                >
                  AI 맞춤 코스 추천받기
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </ScrollReveal>

              <ScrollReveal direction="left" className="relative">
                <div className="relative aspect-square md:aspect-video rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 flex flex-col justify-center items-center group/card overflow-hidden">
                   {/* AI 연출 배경 */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
                      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse delay-700"></div>
                   </div>

                   <div className="flex flex-col items-center gap-6 relative z-10">
                      <div className="relative">
                         <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
                         <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-2xl">
                           <Sparkles className="h-12 w-12 text-white" />
                         </div>
                      </div>
                      <div className="text-center">
                        <div className="flex justify-center gap-1.5 mb-2">
                           {[1, 2, 3, 4, 5].map((i) => (
                             <motion.div
                               key={i}
                               animate={{ height: [8, 20, 8] }}
                               transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                               className="w-1 bg-purple-400 rounded-full"
                             />
                           ))}
                        </div>
                        <p className="text-sm font-bold text-purple-300 tracking-widest uppercase">Analyzing your preference...</p>
                      </div>
                   </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 하단 CTA 섹션 (Final CTA): 가입 유도 구역 */}
      <section className="relative overflow-hidden bg-purple-600 py-24 md:py-32">
        {/* 장식용 배경 원형 효과 */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute right-[5%] bottom-[10%] h-96 w-96 rounded-full bg-blue-400 blur-3xl"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
          <h2 className="mb-8 text-4xl font-extrabold md:text-5xl">
            지금 바로 첫 도심 여행을 만들어보세요.
          </h2>
          <p className="mb-12 text-xl text-purple-100">
            가입 없이도 누구나 모든 일정을 둘러볼 수 있습니다. <br />
            나만의 마을 일정을 저장하고 싶다면 지금 바로 로그인을 해보세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 rounded-xl bg-white px-10 py-5 text-xl font-bold text-purple-600 transition-all hover:scale-105 hover:shadow-2xl"
            >
              <Download className="h-6 w-6" />앱 다운로드 하기
            </button>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-3 rounded-xl bg-purple-700 px-10 py-5 text-xl font-bold text-white transition-all hover:bg-purple-800"
            >
              로그인 / 회원가입
            </button>
          </div>
        </div>
      </section>
      {/* 5. Floating AI Button: AI 추천 페이지로 이동 */}
      <motion.button
        onClick={() => router.push('/ai')}
        initial={{ opacity: 0, scale: 0.5, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.1, translateY: -5 }}
        whileTap={{ scale: 0.9 }}
        className="group fixed bottom-8 right-8 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-2xl shadow-purple-500/40 ring-4 ring-white transition-all hover:shadow-purple-500/60"
      >
        <Sparkles className="h-8 w-8 drop-shadow-md" />
        
        {/* Tooltip-like label for AI */}
        <span className="absolute -top-12 right-0 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 md:block hidden">
          AI 코스 추천받기
          <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900"></span>
        </span>
      </motion.button>
    </div>
  )
}
