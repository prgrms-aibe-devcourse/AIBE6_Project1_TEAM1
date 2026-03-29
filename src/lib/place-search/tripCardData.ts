import { createClient } from '@supabase/supabase-js'

export interface Trip {
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
}

export interface TripItem {
  id: number
  trip_id: number
  place_id: number
  visit_order: number | null
  transport_type: string | null
  travel_time: number | null
  visit_day: number | null
}

export interface Place {
  id: number
  kakao_place_id: string | null
  place_name: string | null
  category: string | null
  latitude: number | null
  longitude: number | null
  is_near_station: boolean | null
  address: string | null
  displayCategory?: string | null
}

export interface TripReview {
  id: number
  user_id: string | null
  rating: number | null
  content: string | null
  created_at: string | null
  trip_id: number
}

export interface TripReviewSummary {
  averageRating: number
  reviewCount: number
}

export interface TripDetailItem extends TripItem {
  place: Place | null
}

export interface TripCardData {
  trip: Trip
  detailItems: TripDetailItem[]
  reviewSummary: TripReviewSummary
}

const CATEGORY_OPTIONS = [
  '전체',
  '음식점',
  '카페',
  '숙박',
  '관광명소',
  '문화시설',
] as const

type CategoryOption = (typeof CATEGORY_OPTIONS)[number]

function inferPlaceCategory(
  rawCategory?: string | null,
): CategoryOption | null {
  const category = (rawCategory ?? '').toLowerCase()

  if (!category) return null

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
    category.includes('분식') ||
    category.includes('치킨') ||
    category.includes('피자') ||
    category.includes('햄버거')
  ) {
    return '음식점'
  }

  if (
    category.includes('호텔') ||
    category.includes('모텔') ||
    category.includes('펜션') ||
    category.includes('게스트하우스') ||
    category.includes('리조트') ||
    category.includes('숙박')
  ) {
    return '숙박'
  }

  if (
    category.includes('박물관') ||
    category.includes('미술관') ||
    category.includes('공연') ||
    category.includes('전시') ||
    category.includes('문화시설') ||
    category.includes('도서관')
  ) {
    return '문화시설'
  }

  if (
    category.includes('관광') ||
    category.includes('공원') ||
    category.includes('해수욕장') ||
    category.includes('산') ||
    category.includes('전망대') ||
    category.includes('테마파크') ||
    category.includes('랜드마크') ||
    category.includes('명소')
  ) {
    return '관광명소'
  }

  return null
}

function includesKeyword(value: string | null | undefined, keyword: string) {
  if (!value) return false
  return value.toLowerCase().includes(keyword.toLowerCase())
}

function createSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function fetchTripCardData(options?: {
  searchKeyword?: string
  category?: CategoryOption
}): Promise<TripCardData[]> {
  const supabase = createSupabase()
  const searchKeyword = options?.searchKeyword ?? ''
  const category = options?.category ?? '전체'
  const trimmedKeyword = searchKeyword.trim()

  let tripsQuery = supabase
    .from('trips')
    .select(
      'id, user_id, title, start_date, end_date, is_public, total_travel_time, total_cost, total_distance, is_saved',
    )
    .order('start_date', { ascending: true })

  if (trimmedKeyword) {
    tripsQuery = tripsQuery.ilike('title', `%${trimmedKeyword}%`)
  }

  const { data: titleMatchedTrips, error: titleTripsError } = await tripsQuery
  if (titleTripsError) throw titleTripsError

  const { data: allTripsRows, error: allTripsError } = await supabase
    .from('trips')
    .select(
      'id, user_id, title, start_date, end_date, is_public, total_travel_time, total_cost, total_distance, is_saved',
    )
    .order('start_date', { ascending: true })

  if (allTripsError) throw allTripsError

  const allTrips = allTripsRows ?? []
  const allTripIds = allTrips.map((trip) => trip.id)

  if (allTripIds.length === 0) {
    return []
  }

  const { data: tripItemsRows, error: tripItemsError } = await supabase
    .from('trip_items')
    .select(
      'id, trip_id, place_id, visit_order, transport_type, travel_time, visit_day',
    )
    .in('trip_id', allTripIds)
    .order('visit_day', { ascending: true })
    .order('visit_order', { ascending: true })

  if (tripItemsError) throw tripItemsError

  const tripItems = tripItemsRows ?? []
  const placeIds = [...new Set(tripItems.map((item) => item.place_id))]

  let placeMap = new Map<number, Place>()

  if (placeIds.length > 0) {
    const { data: placeRows, error: placesError } = await supabase
      .from('places')
      .select(
        'id, kakao_place_id, place_name, category, latitude, longitude, is_near_station, address',
      )
      .in('id', placeIds)

    if (placesError) throw placesError

    placeMap = new Map(
      (placeRows ?? []).map((place) => [
        place.id,
        {
          ...place,
          displayCategory: inferPlaceCategory(place.category) ?? place.category,
        },
      ]),
    )
  }

  const nextTripDetailsMap: Record<number, TripDetailItem[]> = {}

  tripItems.forEach((item) => {
    const place = placeMap.get(item.place_id) ?? null

    if (!nextTripDetailsMap[item.trip_id]) {
      nextTripDetailsMap[item.trip_id] = []
    }

    nextTripDetailsMap[item.trip_id].push({
      ...item,
      place,
    })
  })

  const placeMatchedTripIds = new Set<number>()

  if (trimmedKeyword) {
    allTrips.forEach((trip) => {
      const detailItems = nextTripDetailsMap[trip.id] ?? []

      const hasPlaceMatch = detailItems.some((item) => {
        return (
          includesKeyword(item.place?.place_name, trimmedKeyword) ||
          includesKeyword(item.place?.address, trimmedKeyword)
        )
      })

      if (hasPlaceMatch) {
        placeMatchedTripIds.add(trip.id)
      }
    })
  }

  const titleMatchedIds = new Set(
    (titleMatchedTrips ?? []).map((trip) => trip.id),
  )

  const mergedTrips = trimmedKeyword
    ? allTrips.filter(
        (trip) =>
          titleMatchedIds.has(trip.id) || placeMatchedTripIds.has(trip.id),
      )
    : allTrips

  const categoryFilteredTrips =
    category === '전체'
      ? mergedTrips
      : mergedTrips.filter((trip) =>
          (nextTripDetailsMap[trip.id] ?? []).some(
            (item) => inferPlaceCategory(item.place?.category) === category,
          ),
        )

  const filteredTripIds = categoryFilteredTrips.map((trip) => trip.id)

  let nextTripReviewSummaryMap: Record<number, TripReviewSummary> = {}

  if (filteredTripIds.length > 0) {
    const { data: reviewRows, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, user_id, rating, content, created_at, trip_id')
      .in('trip_id', filteredTripIds)

    if (reviewsError) throw reviewsError

    const groupedReviews = new Map<number, TripReview[]>()

    ;(reviewRows ?? []).forEach((review) => {
      const current = groupedReviews.get(review.trip_id) ?? []
      current.push(review)
      groupedReviews.set(review.trip_id, current)
    })

    nextTripReviewSummaryMap = Object.fromEntries(
      filteredTripIds.map((tripId) => {
        const reviews = groupedReviews.get(tripId) ?? []
        const ratings = reviews
          .map((review) => review.rating)
          .filter((rating): rating is number => rating != null)

        const averageRating =
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0

        return [
          tripId,
          {
            averageRating,
            reviewCount: reviews.length,
          },
        ]
      }),
    )
  }

  return categoryFilteredTrips.map((trip) => ({
    trip,
    detailItems: nextTripDetailsMap[trip.id] ?? [],
    reviewSummary: nextTripReviewSummaryMap[trip.id] ?? {
      averageRating: 0,
      reviewCount: 0,
    },
  }))
}
