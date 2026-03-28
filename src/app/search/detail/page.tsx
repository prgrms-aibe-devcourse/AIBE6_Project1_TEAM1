'use client'

import {
    Bookmark,
    Bus,
    ChevronDown,
    ChevronRight,
    Clock,
    CreditCard,
    Flame,
    Footprints,
    MapPin,
    Route,
    Share2,
    Star,
    ImageIcon
} from 'lucide-react'
import Image from 'next/image'

// --- Mock Data ---
const MOCK_DATA = {
  id: '1',
  title: '영도 흰여울문화마을 산책 코스',
  category: '해안 산책',
  isHot: true,
  rating: 4.2,
  reviewCount: 128,
  location: '부산 영도구',
  imageUrl: '/images/search/yeongdo_coast.png',
  tags: ['가족여행', '힐링', '바다', '해안산책'],
  summary: {
    distance: '3.2km',
    time: '약 2시간',
    spotCount: 5,
    cost: '약 2,400원',
    saveCount: '1,024'
  },
  timeline: [
    { id: 1, name: '남항대교 입구', desc: '출발지 - 버스 정류장 인근', type: 'start', transport: null },
    { id: 2, name: '흰여울문화마을 입구', desc: '벽화 거리 시작점', type: 'spot', transport: { type: 'walk', time: '12분', dist: '0.6km' } },
    { id: 3, name: '절영 해안 산책로', desc: '해안 절벽 뷰포인트', type: 'spot', transport: { type: 'bus', lines: ['5분·7번', '또는 도보 18분 - 0.8km'] } },
    { id: 4, name: '흰여울 카페거리', desc: '오션뷰 카페 밀집 구역', type: 'spot', transport: { type: 'walk', time: '15분', dist: '0.7km' } },
    { id: 5, name: '봉래산 전망대', desc: '영도 전경 파노라마 뷰', type: 'end', transport: { type: 'bus', lines: ['8분·190번 - 1,200원', '또는 도보 20분 - 1.1km'] } }
  ],
  envStats: [
    { label: '경사도', value: 65, level: '보통', min: '평지', max: '급경사' },
    { label: '계단', value: 80, level: '다소 많음', min: '없음', max: '매우 많음' },
    { label: '그늘', value: 30, level: '적음', min: '없음', max: '충분함' }
  ],
  reviews: [
    {
      id: 1,
      user: '산책리_지원',
      date: '2024.12.15',
      rating: 5.0,
      content: '영도의 숨겨진 보석 같은 코스! 해안 절벽을 따라 걷는 구간이 정말 인상적이었어요. 카페거리에서 쉬면서 바다를 바라보는 시간이 최고였습니다.',
      images: ['/images/jeju1.jpg', '/images/jeju2.jpg', '/images/jeju3.jpg'], // Placeholders
      extraCount: 4,
      envRatings: [
        { route: '남항대교 → 흰여울문화마을', incline: '완만', stairs: '없음', shade: '적음' },
        { route: '흰여울문화마을 → 절영 해안', incline: '보통', stairs: '많음', shade: '적음' }
      ]
    }
  ]
}

// --- Sub-components ---

const Breadcrumbs = () => (
  <nav className="flex items-center space-x-2 text-xs text-gray-500 py-4">
    <span className="cursor-pointer hover:text-gray-700">탐색</span>
    <ChevronRight className="h-3 w-3" />
    <span className="cursor-pointer hover:text-gray-700">부산</span>
    <ChevronRight className="h-3 w-3" />
    <span className="text-gray-900 font-medium">영도 흰여울문화마을 산책 코스</span>
  </nav>
)

const SummaryCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
  <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-1">
    <Icon className="h-5 w-5 text-gray-400" />
    <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
)

const EnvStatBar = ({ label, value, level, min, max }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
        {label === '경사도' && <Route className="h-3.5 w-3.5 rotate-45" />}
        {label === '계단' && <ChevronRight className="h-3.5 w-3.5 rotate-[-90deg]" />}
        {label === '그늘' && <Flame className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="text-sm font-bold text-gray-900">{level}</span>
    </div>
    <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-1000" 
        style={{ width: `${value}%` }} 
      />
    </div>
    <div className="flex justify-between text-[10px] text-gray-400">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
)

const TimelineItem = ({ data, isLast }: { data: any, isLast: boolean }) => (
  <div className="relative pl-8">
    {/* Connector Line */}
    {!isLast && (
      <div className="absolute left-[13px] top-7 bottom-[-28px] w-[2px] bg-gray-100 border-l-2 border-dashed border-gray-300" />
    )}
    
    {/* Circle Icon */}
    <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white text-[12px] font-bold z-10">
      {data.id}
    </div>

    {/* Content */}
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm grow mr-4">
        <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center shrink-0">
           <MapPin className="h-5 w-5 text-gray-300" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{data.name}</h4>
          <p className="text-[11px] text-gray-400">{data.desc}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${data.type === 'start' ? 'bg-gray-100 text-gray-500' : data.type === 'end' ? 'bg-gray-100 text-gray-500' : 'bg-white border border-gray-200 text-gray-600'}`}>
          {data.type === 'start' ? '출발' : data.type === 'end' ? '도착' : '포토존'}
        </span>
      </div>
    </div>

    {/* Transport Info */}
    {data.transport && !isLast && (
      <div className="my-6 space-y-1">
        {data.transport.type === 'walk' ? (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Footprints className="h-3 w-3" />
            <span>도보 {data.transport.time} · {data.transport.dist}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-[11px] text-gray-400">
            {data.transport.lines.map((line: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <Bus className="h-3 w-3" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
)

// --- Main Page Component ---

export default function SearchDetailPage() {
  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-2">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Hero Section */}
            <section className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-sm group">
              <Image 
                src={MOCK_DATA.imageUrl} 
                alt={MOCK_DATA.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
              
              {/* Hero Content */}
              <div className="absolute bottom-6 left-8 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded">인기 코스</span>
                  <span className="text-[11px] font-medium text-gray-300">{MOCK_DATA.category}</span>
                </div>
                <h1 className="text-3xl font-bold">{MOCK_DATA.title}</h1>
                <div className="flex flex-wrap gap-2 pt-1 pb-2">
                  {MOCK_DATA.tags.map((tag, i) => (
                    <span key={i} className="text-xs text-gray-300 before:content-['#']">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 border-none" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 border-none" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 border-none" />
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 border-none" />
                    <Star className="h-4 w-4 text-gray-400" />
                    <span className="ml-1 font-bold">{MOCK_DATA.rating}</span>
                    <span className="text-gray-400 font-normal">({MOCK_DATA.reviewCount}개 리뷰)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-300" />
                    <span className="text-gray-300">{MOCK_DATA.location}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Summary Cards */}
            <section className="grid grid-cols-5 gap-4">
              <SummaryCard icon={Route} label="총 거리" value={MOCK_DATA.summary.distance} />
              <SummaryCard icon={Clock} label="소요 시간" value={MOCK_DATA.summary.time} />
              <SummaryCard icon={MapPin} label="장소 수" value={`${MOCK_DATA.summary.spotCount}곳`} />
              <SummaryCard icon={CreditCard} label="총 이동 비용" value={MOCK_DATA.summary.cost} />
              <SummaryCard icon={Bookmark} label="저장 수" value={MOCK_DATA.summary.saveCount} />
            </section>

            {/* Course Timeline */}
            <section className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold text-gray-900">코스 타임라인</h2>
                <span className="text-xs text-gray-400 font-medium">총 {MOCK_DATA.timeline.length}개 장소</span>
              </div>
              <div className="space-y-4 pt-2">
                {MOCK_DATA.timeline.map((item, index) => (
                  <TimelineItem 
                    key={item.id} 
                    data={item} 
                    isLast={index === MOCK_DATA.timeline.length - 1} 
                  />
                ))}
              </div>
            </section>

            {/* Environment Analysis */}
            <section className="rounded-2xl border border-gray-100 p-8 space-y-8 bg-white shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">보행 환경 분석</h2>
                <p className="text-xs text-gray-400">128명의 리뷰어 평균 데이터</p>
              </div>
              <div className="space-y-8">
                {MOCK_DATA.envStats.map((stat, i) => (
                  <EnvStatBar key={i} {...stat} />
                ))}
              </div>
            </section>

            {/* Moving CTA bar here (Inline) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <button className="flex-1 bg-black text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 cursor-pointer shadow-lg active:scale-[0.98] transition-all">
                  <Bus className="h-5 w-5" /> 일정에 추가하기
                </button>
                <button className="h-14 w-14 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-50 bg-white cursor-pointer active:scale-[0.98] transition-all">
                  <Bookmark className="h-6 w-6" />
                </button>
                <button className="h-14 w-14 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-900 hover:bg-gray-50 bg-white cursor-pointer active:scale-[0.98] transition-all">
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-end gap-2">
                <h2 className="text-xl font-bold text-gray-900">리뷰</h2>
                <span className="text-sm text-gray-400 font-medium mb-0.5">{MOCK_DATA.reviewCount}개</span>
              </div>
              <button className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[11px] font-bold hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm">
                리뷰 쓰기
              </button>
            </div>

            {/* Review Filter Tabs */}
            <div className="flex gap-4 border-b border-gray-100 pb-3">
              <button className="text-xs font-bold text-gray-900">최신순</button>
              <button className="text-xs font-semibold text-gray-400 hover:text-gray-600">평점순</button>
              <button className="text-xs font-semibold text-gray-400 hover:text-gray-600">사진순</button>
            </div>

            {/* Review Cards List */}
            <div className="space-y-4">
              {MOCK_DATA.reviews.map((review) => (
                <div key={review.id} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-4">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">SY</div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{review.user}</div>
                        <div className="text-[10px] text-gray-400">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                      <span className="ml-1 text-xs font-bold text-gray-900">{review.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs leading-relaxed text-gray-600">
                    {review.content}
                  </p>

                  {/* Review Media Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {review.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center relative overflow-hidden">
                        <ImageIcon className="h-4 w-4 text-gray-200" />
                         {/* Placeholder overlay for last item */}
                         {i === review.images.length - 1 && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[12px] font-bold">
                             +{review.extraCount}
                           </div>
                         )}
                      </div>
                    ))}
                  </div>

                  {/* Sectional Analysis in Review */}
                  <div className="space-y-3 pt-2">
                    <div className="text-[11px] font-bold text-gray-900">구간별 보행 환경 평가</div>
                    <div className="space-y-2">
                      {review.envRatings.map((env, i) => (
                        <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
                          <div className="text-[11px] font-bold text-gray-700">{env.route}</div>
                          <div className="flex gap-3 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <Route className="h-2.5 w-2.5 rotate-45" /> 경사 <span className="text-gray-600 font-bold">{env.incline}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <ChevronRight className="h-2.5 w-2.5 rotate-[-90deg]" /> 계단 <span className="text-gray-600 font-bold">{env.stairs}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="h-2.5 w-2.5" /> 그늘 <span className="text-gray-600 font-bold">{env.shade}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full py-3 rounded-xl border border-gray-100 bg-white text-xs font-bold text-gray-500 flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors">
                리뷰 더보기 <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
