'use client'

import { createClient } from '@/utils/supabase/client'
import {
  Bookmark,
  Bus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Flame,
  Footprints,
  ImageIcon,
  Loader2,
  MapPin,
  Route,
  Share2,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useModalStore } from '@/store/useModalStore'

interface Place {
  id: number
  kakao_place_id: string | null
  place_name: string | null
  category: string | null
  latitude: number | null
  longitude: number | null
  is_near_station: boolean | null
  address: string | null
}

interface Trip {
  id: number
  user_id: string | null
  title: string | null
  start_date: string | null
  end_date: string | null
  is_public: boolean | null
  total_travel_time: number | null
  total_cost: number | null
  total_distance: number | null
  is_saved: boolean | null
  img_url: string | null
  tags: string | null
}

interface TripItemRow {
  id: number
  trip_id: number
  place_id: number
  visit_order: number | null
  transport_type: string | null
  travel_time: number | null
  visit_day: number | null
}

interface TripDetailItem extends TripItemRow {
  place: Place | null
}

interface TripReview {
  id: number
  user_id: string | null
  rating: number | null
  content: string | null
  created_at: string | null
  trip_id: number
  images: string[]
}

interface ReviewRouteRow {
  id: number
  trip_id: number
  start: number
  end: number
  slope: string | null
  stairs: string | null
  shade: string | null
  user_id: string | null
  transport_type: string | null
  review_id: number
  order: number
}

interface ReviewRoute extends ReviewRouteRow {
  startPlaceName: string
  endPlaceName: string
}

interface PlaceDetailPageProps {
  tripId: number
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}

interface EnvStatBarProps {
  label: string
  value: number
  level: string
  min: string
  max: string
}

interface TimelineItemProps {
  data: {
    id: number
    day: number | null
    name: string
    desc: string
    type: 'start' | 'spot' | 'end'
    transport: {
      type: 'walk' | 'bus' | null
      time?: string
      dist?: string
      lines?: string[]
    } | null
  }
  isLast: boolean
}

type EnvMetricKey = 'slope' | 'stairs' | 'shade'

function formatDistance(value?: number | null) {
  if (value == null) return '-'
  return `${value.toLocaleString()}km`
}

function formatTravelTime(value?: number | null) {
  if (value == null) return '-'

  if (value < 60) return `약 ${value}분`

  const hour = Math.floor(value / 60)
  const minute = value % 60

  if (minute === 0) return `약 ${hour}시간`
  return `약 ${hour}시간 ${minute}분`
}

function formatCost(value?: number | null) {
  if (value == null) return '-'
  return `약 ${value.toLocaleString()}원`
}

function formatSaveCount(isSaved?: boolean | null) {
  return isSaved ? '저장됨' : '-'
}

function getTripDurationDays(
  startDate?: string | null,
  endDate?: string | null,
) {
  if (!startDate) return null

  const normalizedEndDate = endDate ?? startDate

  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${normalizedEndDate}T00:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null
  }

  const diffMs = end.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1

  return diffDays > 0 ? diffDays : null
}

function getTripDurationLabel(
  startDate?: string | null,
  endDate?: string | null,
) {
  const days = getTripDurationDays(startDate, endDate)

  if (!days) return '-'
  if (days === 1) return '당일치기'

  return `${days} Days`
}

function inferPlaceCategory(rawCategory?: string | null) {
  const category = rawCategory ?? ''

  if (!category) return '기타'

  if (
    category.includes('카페') ||
    category.includes('커피') ||
    category.includes('디저트') ||
    category.includes('베이커리')
  ) {
    return '카페'
  }

  if (
    category.includes('음식점') ||
    category.includes('식당') ||
    category.includes('맛집') ||
    category.includes('한식') ||
    category.includes('중식') ||
    category.includes('일식') ||
    category.includes('양식') ||
    category.includes('분식')
  ) {
    return '음식점'
  }

  if (
    category.includes('호텔') ||
    category.includes('모텔') ||
    category.includes('펜션') ||
    category.includes('게스트하우스') ||
    category.includes('숙박')
  ) {
    return '숙박'
  }

  if (
    category.includes('박물관') ||
    category.includes('미술관') ||
    category.includes('공연') ||
    category.includes('전시') ||
    category.includes('문화')
  ) {
    return '문화시설'
  }

  if (
    category.includes('공원') ||
    category.includes('관광') ||
    category.includes('명소') ||
    category.includes('전망대') ||
    category.includes('해수욕장') ||
    category.includes('랜드마크')
  ) {
    return '관광명소'
  }

  return category
}

function extractLocation(detailItems: TripDetailItem[]) {
  const firstAddress = detailItems.find((item) => item.place?.address)?.place
    ?.address

  if (!firstAddress) return '위치 정보 없음'

  const parts = firstAddress.split(' ')
  return parts.slice(0, 2).join(' ')
}

function buildTags(detailItems: TripDetailItem[]) {
  const categories = detailItems
    .map((item) => inferPlaceCategory(item.place?.category))
    .filter(Boolean)

  return [...new Set(categories)].slice(0, 4)
}

function buildTimeline(
  detailItems: TripDetailItem[],
): TimelineItemProps['data'][] {
  return detailItems.map((item, index) => {
    const isFirst = index === 0
    const isLast = index === detailItems.length - 1

    let transport: TimelineItemProps['data']['transport'] = null
    let itemType: TimelineItemProps['data']['type'] = 'spot'

    if (isFirst) {
      itemType = 'start'
    } else if (isLast) {
      itemType = 'end'
    }

    if (!isLast) {
      if (item.transport_type === 'walk') {
        transport = {
          type: 'walk',
          time: item.travel_time != null ? `${item.travel_time}분` : '-',
          dist: '-',
        }
      } else if (item.transport_type) {
        transport = {
          type: 'bus',
          lines: [
            item.travel_time != null
              ? `${item.travel_time}분 · ${item.transport_type}`
              : item.transport_type,
          ],
        }
      }
    }

    return {
      id: item.visit_order ?? index + 1,
      day: item.visit_day ?? null,
      name: item.place?.place_name || '장소 이름 없음',
      desc: item.place?.address || '주소 정보 없음',
      type: itemType,
      transport,
    }
  })
}

function getInitials(userId?: string | null) {
  if (!userId) return 'U'
  return userId.slice(0, 2).toUpperCase()
}

function getDisplayName(userId?: string | null) {
  if (!userId) return '사용자'
  return `뚜벅이_${userId.slice(0, 4)}`
}

function getRouteLabel(route: ReviewRoute) {
  return `${route.startPlaceName} → ${route.endPlaceName}`
}

function normalizeSlopeLabel(value?: string | null) {
  if (!value) return '정보 없음'

  const normalized = value.trim()

  if (normalized === '평지') return '평지'
  if (normalized === '보통') return '보통'
  if (normalized === '가파름') return '가파름'

  return value
}

function normalizeStairsLabel(value?: string | null) {
  if (!value) return '정보 없음'

  const normalized = value.trim()

  if (normalized === '없음') return '없음'
  if (normalized === '있음') return '있음'

  return value
}

function normalizeShadeLabel(value?: string | null) {
  if (!value) return '정보 없음'

  const normalized = value.trim()

  if (normalized === '적음') return '적음'
  if (normalized === '보통') return '보통'
  if (normalized === '많음') return '많음'

  return value
}

function normalizeEnvValue(
  key: EnvMetricKey,
  value?: string | null,
): number | null {
  if (!value) return null

  const normalized = value.trim()

  if (key === 'slope') {
    if (normalized === '평지') return 90
    if (normalized === '보통') return 60
    if (normalized === '가파름') return 30
    return null
  }

  if (key === 'stairs') {
    if (normalized === '없음') return 90
    if (normalized === '있음') return 30
    return null
  }

  if (key === 'shade') {
    if (normalized === '많음') return 90
    if (normalized === '보통') return 60
    if (normalized === '적음') return 30
    return null
  }

  return null
}

function getEnvLevelFromAverage(key: EnvMetricKey, avg: number | null): string {
  if (avg === null) return '정보 없음'

  if (key === 'slope') {
    if (avg >= 75) return '평지'
    if (avg >= 45) return '보통'
    return '가파름'
  }

  if (key === 'stairs') {
    if (avg >= 60) return '없음'
    return '있음'
  }

  if (key === 'shade') {
    if (avg >= 75) return '많음'
    if (avg >= 45) return '보통'
    return '적음'
  }

  return '정보 없음'
}

function buildEnvStatFromRoutes(
  key: EnvMetricKey,
  label: string,
  routes: Array<{
    slope?: string | null
    stairs?: string | null
    shade?: string | null
  }>,
): EnvStatBarProps {
  const values = routes
    .map((route) => normalizeEnvValue(key, route[key]))
    .filter((value): value is number => value !== null)

  const minMap: Record<EnvMetricKey, string> = {
    slope: '평지',
    stairs: '없음',
    shade: '적음',
  }

  const maxMap: Record<EnvMetricKey, string> = {
    slope: '가파름',
    stairs: '있음',
    shade: '많음',
  }

  if (values.length === 0) {
    return {
      label,
      value: 40,
      level: '정보 없음',
      min: minMap[key],
      max: maxMap[key],
    }
  }

  const average = Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  )

  return {
    label,
    value: average,
    level: getEnvLevelFromAverage(key, average),
    min: minMap[key],
    max: maxMap[key],
  }
}

const SummaryCard = ({ icon: Icon, label, value }: SummaryCardProps) => (
  <div className="flex flex-col items-center justify-center space-y-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <Icon className="h-5 w-5 text-gray-400" />
    <span className="text-[10px] font-medium text-gray-400">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
)

const EnvStatBar = ({ label, value, level, min, max }: EnvStatBarProps) => (
  <div className="space-y-2">
    <div className="flex items-end justify-between">
      <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
        {label === '경사도' && <Route className="h-3.5 w-3.5 rotate-45" />}
        {label === '계단' && (
          <ChevronRight className="h-3.5 w-3.5 rotate-[-90deg]" />
        )}
        {label === '그늘' && <Flame className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="text-sm font-bold text-gray-900">{level}</span>
    </div>

    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-black transition-all duration-1000"
        style={{ width: `${value}%` }}
      />
    </div>

    <div className="flex justify-between text-[10px] text-gray-400">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
)

const TimelineItem = ({ data, isLast }: TimelineItemProps) => (
  <div className="relative pl-8">
    {!isLast && (
      <div className="absolute left-[13px] top-7 bottom-[-28px] w-[2px] border-l-2 border-dashed border-gray-300 bg-gray-100" />
    )}

    <div className="absolute left-0 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black text-[12px] font-bold text-white">
      {data.id}
    </div>

    <div className="group flex items-center justify-between">
      <div className="mr-4 flex grow items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
          <MapPin className="h-5 w-5 text-gray-300" />
        </div>

        <div className="min-w-0">
          {data.day != null && (
            <p className="mb-1 text-[11px] font-semibold text-purple-600">
              Day {data.day}
            </p>
          )}
          <h4 className="text-sm font-bold text-gray-900">{data.name}</h4>
          <p className="truncate text-[11px] text-gray-400">{data.desc}</p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <span
          className={`rounded px-2.5 py-1 text-[10px] font-bold ${
            data.type === 'start'
              ? 'bg-gray-100 text-gray-500'
              : data.type === 'end'
                ? 'bg-gray-100 text-gray-500'
                : 'border border-gray-200 bg-white text-gray-600'
          }`}
        >
          {data.type === 'start'
            ? '출발'
            : data.type === 'end'
              ? '도착'
              : '포토존'}
        </span>
      </div>
    </div>

    {data.transport && !isLast && (
      <div className="my-6 space-y-1">
        {data.transport.type === 'walk' ? (
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Footprints className="h-3 w-3" />
            <span>
              도보 {data.transport.time} · {data.transport.dist}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-[11px] text-gray-400">
            {(data.transport.lines ?? []).map((line, i) => (
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

export default function PlaceDetailPage({ tripId }: PlaceDetailPageProps) {
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [detailItems, setDetailItems] = useState<TripDetailItem[]>([])
  const [reviews, setReviews] = useState<TripReview[]>([])
  const [reviewRoutes, setReviewRoutes] = useState<ReviewRoute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [userReviewId, setUserReviewId] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [sortOrder, setSortOrder] = useState<'latest' | 'rating' | 'photo'>(
    'latest',
  )
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3)
  const [isCompleted, setIsCompleted] = useState(false)
  const { openModal } = useModalStore()

  const supabase = createClient()

  useEffect(() => {
    if (!supabase) {
      setErrorMessage('Supabase 환경변수가 설정되지 않았습니다.')
      setIsLoading(false)
      return
    }

    if (!tripId || Number.isNaN(Number(tripId))) {
      setErrorMessage('유효하지 않은 일정 ID입니다.')
      setIsLoading(false)
      return
    }

    let isMounted = true

    const fetchTripDetail = async () => {
      try {
        if (!isMounted) return

        setIsLoading(true)
        setErrorMessage('')

        const {
          data: { session },
        } = await supabase.auth.getSession()
        const currentUserId = session?.user?.id ?? null
        if (isMounted) setUserId(currentUserId)

        if (currentUserId) {
          const { data: bookmarkData } = await supabase
            .from('bookmark')
            .select('id')
            .eq('user_id', currentUserId)
            .eq('trips_id', tripId)
            .maybeSingle()

          if (isMounted) setIsBookmarked(!!bookmarkData)
        }

        console.log('[fetchTripDetail] start', { tripId })

        const { data: tripRow, error: tripError } = await supabase
          .from('trips')
          .select(
            'id, user_id, title, start_date, end_date, is_public, total_travel_time, total_cost, total_distance, is_saved, img_url, tags',
          )
          .eq('id', tripId)
          .maybeSingle()

        if (tripError) {
          console.error('[fetchTripDetail] trip query error:', tripError)
          throw tripError
        }

        if (!tripRow) {
          if (!isMounted) return
          setTrip(null)
          setDetailItems([])
          setReviews([])
          setReviewRoutes([])
          setErrorMessage('')
          return
        }

        const { data: tripItemsRows, error: tripItemsError } = await supabase
          .from('trip_items')
          .select(
            'id, trip_id, place_id, visit_order, transport_type, travel_time, visit_day',
          )
          .eq('trip_id', tripId)
          .order('visit_day', { ascending: true })
          .order('visit_order', { ascending: true })

        if (tripItemsError) {
          console.error(
            '[fetchTripDetail] trip_items query error:',
            tripItemsError,
          )
          throw tripItemsError
        }

        const placeIds = [
          ...new Set(
            (tripItemsRows ?? [])
              .map((item) => item.place_id)
              .filter((id): id is number => typeof id === 'number'),
          ),
        ]

        let placeMap = new Map<number, Place>()

        if (placeIds.length > 0) {
          const { data: placeRows, error: placesError } = await supabase
            .from('places')
            .select(
              'id, kakao_place_id, place_name, category, latitude, longitude, is_near_station, address',
            )
            .in('id', placeIds)

          if (placesError) {
            console.error('[fetchTripDetail] places query error:', placesError)
            throw placesError
          }

          placeMap = new Map(
            (placeRows ?? []).map((place) => [place.id, place]),
          )
        }

        const mergedItems: TripDetailItem[] = (tripItemsRows ?? []).map(
          (item) => ({
            ...item,
            place: placeMap.get(item.place_id) ?? null,
          }),
        )

        const { data: reviewRows, error: reviewsError } = await supabase
          .from('reviews')
          .select(
            `
    id, user_id, rating, content, created_at, trip_id,
    images(file_url)
  `,
          )
          .eq('trip_id', tripId)
          .order('created_at', { ascending: false })

        if (reviewsError) {
          console.error('[fetchTripDetail] reviews query error:', reviewsError)
          throw reviewsError
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const currentUserId = user.id

          const { data: travelerData, error: travelerError } = await supabase
            .from('travelers')
            .select('status')
            .eq('user_id', currentUserId)
            .eq('trip_id', tripId)
            .maybeSingle()

          if (travelerError) {
            console.error(
              '[fetchTripDetail] travelers query error:',
              travelerError,
            )
            setIsCompleted(false)
          } else {
            setIsCompleted(travelerData?.status === 'completed')
          }

          const myReview = (reviewRows ?? []).find(
            (review) => review.user_id === currentUserId,
          )

          if (myReview) {
            setUserReviewId(Number(myReview.id))
          } else {
            setUserReviewId(null)
          }
        }

        if (!isMounted) return

        const processedReviews: TripReview[] = (reviewRows ?? []).map(
          (review) => {
            const imageUrls: string[] =
              review.images && Array.isArray(review.images)
                ? review.images
                    .map((img: { file_url: string }) => img.file_url)
                    .filter(Boolean)
                : []

            return {
              id: Number(review.id),
              user_id: review.user_id ?? null,
              rating: review.rating ?? null,
              content: review.content ?? null,
              created_at: review.created_at ?? null,
              trip_id: Number(review.trip_id),
              images: imageUrls,
            }
          },
        )
        setReviews(processedReviews)

        const { data: routeRows, error: routesError } = await supabase
          .from('routes')
          .select(
            'id, trip_id, start, end, slope, stairs, shade, user_id, transport_type, review_id, order',
          )
          .eq('trip_id', tripId)
          .order('order', { ascending: true })

        if (routesError) {
          console.error('[fetchTripDetail] routes query error:', routesError)
          throw routesError
        }

        const routePlaceIds = [
          ...new Set(
            (routeRows ?? [])
              .flatMap((route) => [route.start, route.end])
              .filter((id): id is number => typeof id === 'number'),
          ),
        ]

        let routePlaceMap = new Map<number, Place>()

        if (routePlaceIds.length > 0) {
          const { data: routePlaceRows, error: routePlacesError } =
            await supabase
              .from('places')
              .select(
                'id, kakao_place_id, place_name, category, latitude, longitude, is_near_station, address',
              )
              .in('id', routePlaceIds)

          if (routePlacesError) {
            console.error(
              '[fetchTripDetail] route places query error:',
              routePlacesError,
            )
            throw routePlacesError
          }

          routePlaceMap = new Map(
            (routePlaceRows ?? []).map((place) => [place.id, place]),
          )
        }

        const mappedReviewRoutes: ReviewRoute[] = (
          (routeRows ?? []) as ReviewRouteRow[]
        ).map((route) => ({
          ...route,
          startPlaceName:
            routePlaceMap.get(route.start)?.place_name || '출발지 정보 없음',
          endPlaceName:
            routePlaceMap.get(route.end)?.place_name || '도착지 정보 없음',
        }))

        if (!isMounted) return

        console.log('[fetchTripDetail] success', {
          trip: tripRow,
          tripItemsCount: mergedItems.length,
          reviewsCount: (reviewRows ?? []).length,
          routesCount: mappedReviewRoutes.length,
        })

        setTrip(tripRow)
        setDetailItems(mergedItems)
        setReviewRoutes(mappedReviewRoutes)
      } catch (error: unknown) {
        console.error('[fetchTripDetail] raw error:', error)

        if (error instanceof Error) {
          console.error('[fetchTripDetail] message:', error.message)
          console.error('[fetchTripDetail] stack:', error.stack)
        }

        const supabaseError = error as {
          message?: string
          details?: string
          hint?: string
          code?: string
        }

        console.error('[fetchTripDetail] parsed error:', {
          message: supabaseError?.message,
          details: supabaseError?.details,
          hint: supabaseError?.hint,
          code: supabaseError?.code,
        })

        if (!isMounted) return

        setErrorMessage(
          supabaseError?.message ||
            supabaseError?.details ||
            '상세 일정을 불러오는 중 오류가 발생했습니다.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTripDetail()

    return () => {
      isMounted = false
    }
  }, [supabase, tripId])

  const sortedReviews = React.useMemo(() => {
    if (!reviews) return []

    switch (sortOrder) {
      case 'rating':
        return [...reviews].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))

      case 'photo':
        return [...reviews].sort(
          (a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0),
        )

      case 'latest':
      default:
        return [...reviews].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
        })
    }
  }, [reviews, sortOrder])

  const visibleReviews = sortedReviews.slice(0, visibleReviewsCount)

  const handleSaveToMyTrips = async () => {
    if (!supabase || !trip) return

    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const currentUserId = user.id

      const { data: newTrip, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: currentUserId,
          title: trip.title,
          start_date: trip.start_date,
          end_date: trip.end_date,
          is_public: false,
          is_saved: true,
          total_distance: trip.total_distance,
          total_travel_time: trip.total_travel_time,
          total_cost: trip.total_cost,
          img_url: trip.img_url,
          tags: trip.tags,
        })
        .select()
        .single()

      if (tripError || !newTrip) throw tripError

      const itemsToInsert = detailItems.map((item) => ({
        trip_id: newTrip.id,
        place_id: item.place_id,
        visit_order: item.visit_order,
        transport_type: item.transport_type,
        travel_time: item.travel_time,
        visit_day: item.visit_day,
      }))

      const { error: itemsError } = await supabase
        .from('trip_items')
        .insert(itemsToInsert)

      if (itemsError) throw itemsError

      openModal({
        type: 'alert',
        variant: 'primary',
        title: '저장 완료',
        description: '내 보관함에 일정이 추가되었습니다!',
        onConfirm: () => router.push(`/plan?id=${newTrip.id}`),
      })
    } catch (error) {
      console.error('일정 복사 중 오류:', error)
      openModal({
        type: 'alert',
        variant: 'danger',
        title: '저장 실패',
        description: '일정을 저장하는 중 오류가 발생했습니다.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleBookmark = async () => {
    if (!userId) {
      router.push('/login')
      return
    }

    if (isBookmarked) {
      const { error } = await supabase
        .from('bookmark')
        .delete()
        .eq('user_id', userId)
        .eq('trips_id', tripId)

      if (!error) {
        setIsBookmarked(false)
      }
    } else {
      const { error } = await supabase
        .from('bookmark')
        .insert({ user_id: userId, trips_id: tripId })

      if (!error) {
        setIsBookmarked(true)
      }
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          상세 일정을 불러오는 중입니다...
        </p>
      </section>
    )
  }

  if (errorMessage) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-500">{errorMessage}</p>
      </section>
    )
  }

  if (!trip) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">해당 일정을 찾을 수 없습니다.</p>
      </section>
    )
  }

  const durationLabel = getTripDurationLabel(trip.start_date, trip.end_date)
  const location = extractLocation(detailItems)
  const tags = buildTags(detailItems)
  const timeline = buildTimeline(detailItems)

  const summary = {
    distance: formatDistance(trip.total_distance),
    time: formatTravelTime(trip.total_travel_time),
    spotCount: detailItems.length,
    cost: formatCost(trip.total_cost),
    saveCount: formatSaveCount(trip.is_saved),
  }

  const walkRoutesForEnv = reviewRoutes ?? []

  const envStats: EnvStatBarProps[] = [
    buildEnvStatFromRoutes('slope', '경사도', walkRoutesForEnv),
    buildEnvStatFromRoutes('stairs', '계단', walkRoutesForEnv),
    buildEnvStatFromRoutes('shade', '그늘', walkRoutesForEnv),
  ]

  const hasEnvData = walkRoutesForEnv.some(
    (route) =>
      normalizeEnvValue('slope', route.slope) !== null ||
      normalizeEnvValue('stairs', route.stairs) !== null ||
      normalizeEnvValue('shade', route.shade) !== null,
  )

  const validRatings = reviews
    .map((review) => review.rating)
    .filter((rating): rating is number => rating != null)

  const averageRating =
    validRatings.length > 0
      ? validRatings.reduce((sum, rating) => sum + rating, 0) /
        validRatings.length
      : 0

  const averageRatingText = reviews.length > 0 ? averageRating.toFixed(1) : '-'

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <nav className="flex items-center space-x-2 py-4 text-xs text-gray-500">
          <button
            type="button"
            onClick={() => router.push('/search')}
            className="cursor-pointer hover:text-gray-700"
          >
            탐색
          </button>
          <ChevronRight className="h-3 w-3" />
          <span>{location}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-gray-900">
            {trip.title || '제목 없는 일정'}
          </span>
        </nav>

        <div className="mt-2 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                뒤로가기
              </button>

              <span className="rounded-full border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300">
                {durationLabel}
              </span>
            </div>

            <section className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-sm">
              <div className="absolute inset-0">
                {trip.img_url && (
                  <Image
                    src={trip.img_url}
                    alt="trip image"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />

              <div className="absolute bottom-6 left-8 space-y-2 text-white z-10">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                    일정 코스
                  </span>
                  <span className="text-[11px] font-medium text-gray-300">
                    {tags[0] || '여행 일정'}
                  </span>
                </div>

                <h1 className="text-3xl font-bold">
                  {trip.title || '제목 없는 일정'}
                </h1>

                <div className="flex flex-wrap gap-2 pb-2 pt-1">
                  {tags.length > 0 ? (
                    tags.map((tag, i) => (
                      <span
                        key={`${tag}-${i}`}
                        className="text-xs text-gray-300 before:content-['#']"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-300 before:content-['#']">
                      여행
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-bold">{averageRatingText}</span>
                    <span className="font-normal text-gray-400">
                      ({reviews.length}개 리뷰)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-300" />
                    <span className="text-gray-300">{location}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <SummaryCard
                icon={Route}
                label="총 거리"
                value={summary.distance}
              />
              <SummaryCard
                icon={Clock}
                label="소요 시간"
                value={summary.time}
              />
              <SummaryCard
                icon={MapPin}
                label="장소 수"
                value={`${summary.spotCount}곳`}
              />
              <SummaryCard
                icon={CreditCard}
                label="총 이동 비용"
                value={summary.cost}
              />
              <SummaryCard
                icon={Bookmark}
                label="저장 여부"
                value={summary.saveCount}
              />
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-gray-900">
                  코스 타임라인
                </h2>
                <span className="text-xs font-medium text-gray-400">
                  총 {timeline.length}개 장소
                </span>
              </div>

              <div className="space-y-4 pt-2">
                {timeline.length > 0 ? (
                  timeline.map((item, index) => (
                    <TimelineItem
                      key={`${item.id}-${index}`}
                      data={item}
                      isLast={index === timeline.length - 1}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
                    등록된 장소가 없습니다.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">
                  보행 환경 분석
                </h2>
                <p className="text-xs text-gray-400">
                  {hasEnvData
                    ? '리뷰의 구간별 보행 환경 평가 평균값을 반영했어요.'
                    : '아직 분석 데이터가 없습니다.'}
                </p>
              </div>

              <div className="space-y-8">
                {envStats.map((stat, i) => (
                  <EnvStatBar key={i} {...stat} />
                ))}
              </div>
            </section>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveToMyTrips}
                  disabled={isSaving}
                  className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-black font-bold text-white shadow-lg transition-all hover:bg-gray-900 active:scale-[0.98] disabled:bg-gray-400"
                >
                  {isSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Bus className="h-5 w-5" />
                  )}
                  일정에 추가하기
                </button>

                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] ${
                    isBookmarked
                      ? 'text-purple-600 border-purple-100'
                      : 'text-gray-900'
                  }`}
                >
                  <Bookmark
                    className={`h-6 w-6 ${isBookmarked ? 'fill-purple-600' : ''}`}
                  />
                </button>

                <button
                  type="button"
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-900 transition-all hover:bg-gray-50 active:scale-[0.98]"
                >
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="flex items-center justify-between">
              <div className="flex items-end gap-2">
                <h2 className="text-xl font-bold text-gray-900">리뷰</h2>
                <span className="mb-0.5 text-sm font-medium text-gray-400">
                  {reviews.length}개
                </span>
              </div>

              {userId &&
                isCompleted &&
                (userReviewId ? (
                  <button
                    type="button"
                    className="rounded-lg bg-gray-900 dark:bg-purple-600 px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-black dark:hover:bg-purple-700 active:scale-95"
                    onClick={() =>
                      router.push(`/mypage/reviews?tripId=${tripId}`)
                    }
                  >
                    리뷰 수정
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg bg-gray-900 dark:bg-purple-600 px-4 py-2 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-black dark:hover:bg-purple-700 active:scale-95"
                    onClick={() =>
                      router.push(`/review/write?tripId=${tripId}`)
                    }
                  >
                    리뷰 쓰기
                  </button>
                ))}
            </div>

            <div className="flex gap-3 pb-3">
              <button
                type="button"
                className={`rounded-xl px-3 py-1.5 text-sm font-bold ${
                  sortOrder === 'latest'
                    ? 'text-gray-900'
                    : 'text-gray-700 bg-white border border-gray-200'
                }`}
                onClick={() => setSortOrder('latest')}
              >
                최신순
              </button>
              <button
                type="button"
                className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
                  sortOrder === 'rating'
                    ? 'text-gray-900'
                    : 'text-gray-700 bg-white border border-gray-200'
                }`}
                onClick={() => setSortOrder('rating')}
              >
                평점순
              </button>
              <button
                type="button"
                className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
                  sortOrder === 'photo'
                    ? 'text-gray-900'
                    : 'text-gray-700 bg-white border border-gray-200'
                }`}
                onClick={() => setSortOrder('photo')}
              >
                사진순
              </button>
            </div>

            <div className="space-y-6">
              {visibleReviews.length > 0 ? (
                visibleReviews.map((review) => {
                  const routesForReview = reviewRoutes.filter(
                    (route) => route.review_id === review.id,
                  )

                  return (
                    <div
                      key={review.id}
                      className="space-y-4 rounded-[26px] border border-gray-300 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-bold text-gray-400">
                            {getInitials(review.user_id)}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-bold leading-tight text-gray-900">
                                {getDisplayName(review.user_id)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {review.created_at
                                  ? new Date(
                                      review.created_at,
                                    ).toLocaleDateString('ko-KR')
                                  : '-'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < (review.rating ?? 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-3xl font-bold text-gray-900">
                              {review.rating != null
                                ? review.rating.toFixed(1)
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm leading-6 text-gray-600">
                        {review.content || '리뷰 내용이 없습니다.'}
                      </div>

                      <div className="grid grid-cols-4 gap-2.5">
                        {review.images.slice(0, 4).map((url, index) => (
                          <div
                            key={index}
                            className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-100"
                          >
                            <img
                              src={url}
                              alt={`review-${review.id}-img-${index}`}
                              className="h-full w-full object-cover"
                            />
                            {index === 3 && review.images.length > 4 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-bold text-white">
                                +{review.images.length - 4}
                              </div>
                            )}
                          </div>
                        ))}

                        {review.images.length === 0 &&
                          Array.from({ length: 4 }).map((_, index) => (
                            <div
                              key={index}
                              className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-100"
                            >
                              <ImageIcon className="h-6 w-6 text-gray-300" />
                            </div>
                          ))}
                      </div>

                      <div className="border-t border-gray-200 pt-5">
                        <h4 className="mb-3 text-base font-bold text-gray-800">
                          구간별 보행 환경 평가
                        </h4>

                        <div className="space-y-3">
                          {routesForReview.length > 0 ? (
                            routesForReview.map((route) => (
                              <div
                                key={route.id}
                                className="rounded-2xl bg-gray-50 px-4 py-4"
                              >
                                <div className="mb-2 text-sm font-semibold leading-6 text-gray-900">
                                  {getRouteLabel(route)}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                                  <span>
                                    ↗ 경사{' '}
                                    <strong className="font-bold text-gray-900">
                                      {normalizeSlopeLabel(route.slope)}
                                    </strong>
                                  </span>

                                  <span>
                                    ↑ 계단{' '}
                                    <strong className="font-bold text-gray-900">
                                      {normalizeStairsLabel(route.stairs)}
                                    </strong>
                                  </span>

                                  <span>
                                    ♤ 그늘{' '}
                                    <strong className="font-bold text-gray-900">
                                      {normalizeShadeLabel(route.shade)}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-500">
                              연결된 보행 환경 평가가 없습니다.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-400">
                        -
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          아직 리뷰가 없어요
                        </div>
                        <div className="text-[10px] text-gray-400">
                          첫 리뷰를 남겨보세요
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-gray-200" />
                      ))}
                      <span className="ml-1 text-xs font-bold text-gray-900">
                        -
                      </span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-gray-600">
                    아직 등록된 리뷰가 없습니다.
                  </p>
                </div>
              )}

              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 rounded-xl border border-gray-100 bg-white py-3 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50"
                onClick={() => setVisibleReviewsCount((prev) => prev + 3)}
                disabled={visibleReviewsCount >= sortedReviews.length}
              >
                리뷰 더보기 <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
