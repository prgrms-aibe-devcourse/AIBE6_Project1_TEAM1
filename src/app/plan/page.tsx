'use client'

import CommonButton from '@/components/domain/plan/CommonButton'
import FilterBadge from '@/components/domain/plan/FilterBadge'
import ItineraryMap from '@/components/domain/plan/ItineraryMap'
import PlaceSearchModal from '@/components/domain/plan/PlaceSearchModal'
import SaveTripModal from '@/components/domain/plan/SaveTripModal'
import MyTripsSidebar from '@/components/domain/plan/MyTripsSidebar'
import TimelineList from '@/components/domain/plan/TimelineList'
import GlobalHeader from '@/components/layout/GlobalHeader'
import PageContainer from '@/components/layout/PageContainer'
import { createClient } from '@/utils/supabase/client'
import {
  Calendar,
  FolderOpen,
  MapPin,
  MoreHorizontal,
  Share2,
  Sparkles,
} from 'lucide-react'
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 글로벌 공통 장소 데이터 구조
export interface Place {
  id: string
  kakao_place_id?: string // DB(places)와 연결하기 위한 필수 식별 고유키
  name: string
  category: string
  address: string
  lat: number
  lng: number
}

function PlanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTripId = searchParams.get('id'); // URL에서 ?id= 파라미터 획득

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null)

  // 1개짜리 배열에서 N박 M일을 지원하는 객체(Record) 형태로 확장
  const [placesByDay, setPlacesByDay] = useState<Record<number, Place[]>>({
    1: [
      {
        id: '1',
        name: '불국사',
        category: '관광',
        address: '경북 경주시 진현동 15',
        lat: 35.790104,
        lng: 129.332079,
      },
      {
        id: '2',
        name: '석굴암',
        category: '관광',
        address: '경북 경주시 불국로 873-243',
        lat: 35.794939,
        lng: 129.349141,
      },
    ],
  })
  // 현재 보고 있는 활성 탭 (ex: Day 1)
  const [currentDay, setCurrentDay] = useState<number>(1)

  // 모달창 on/off 상태 관리
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // 사이드바 관리 추가

  const handleSelectTrip = (id: string) => {
    setIsSidebarOpen(false);
    if (id === 'new') {
      router.push('/plan');
      setPlacesByDay({ 1: [] });
      setCurrentDay(1);
    } else {
      router.push(`/plan?id=${id}`);
    }
  };

  // 인증 검사 로직 (마운트 시점 1회 실행)
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // 비회원이면 뒤로가기 불가능한 대체(replace) 방식으로 로그인 창 이동
        router.replace('/login')
      } else {
        // 회원이면 고유 ID 저장 후 로딩 해제
        setUserId(session.user.id)
        setIsAuthChecking(false)
      }
    }

    checkAuth();
  }, [router]);

  // editTripId가 존재하고 유저 인증이 완료되었을 때, DB에서 기존 플랜 데이터를 불러옵니다.
  useEffect(() => {
    if (!editTripId || !userId) return;

    const fetchExistingTrip = async () => {
      try {
        const supabase = createClient();
        
        // trips와 매핑된 trip_items, places를 한 번에 Join해서 가져옵니다.
        const { data: tripData, error } = await supabase
          .from('trips')
          .select(`
            id, title, start_date, end_date, is_public,
            trip_items (
              visit_order,
              places (
                id, kakao_place_id, place_name, category, latitude, longitude
              )
            )
          `)
          .eq('id', editTripId)
          .eq('user_id', userId)
          .single();

        if (error || !tripData) {
          console.error("여행 불러오기 에러:", error);
          alert("여행 정보를 불러올 수 없거나 권한이 없습니다.");
          return;
        }

        // 다른 여행을 클릭해서 넘어왔을 수도 있으니 강제로 찌꺼기를 세탁합니다.
        const fetchedPlaces: Place[] = [];
        const items = tripData.trip_items || [];
        
        // 데이터베이스의 visit_order 기준으로 카드 순서 정렬
        items.sort((a: any, b: any) => a.visit_order - b.visit_order);

        items.forEach((item: any) => {
          if (item.places) {
            fetchedPlaces.push({
              id: Date.now().toString() + Math.random(), // 화면 렌더링(DND)용 임시 로컬 ID
              kakao_place_id: item.places.kakao_place_id,
              name: item.places.place_name,
              category: item.places.category,
              address: "주소 정보 없음 (DB에 미저장됨)", // 참고: 현재 ERD의 places에 주소 컬럼이 없습니다.
              lat: item.places.latitude,
              lng: item.places.longitude,
            });
          }
        });

        // 현재는 DB에 visit_day 구분이 없으므로, 불러온 모든 일정을 Day 1 탭에 몰아서 렌더링합니다.
        // 추후 trip_items 테이블에 visit_day 컬럼이 생기면 이 부분을 날짜별로 분할할 수 있습니다.
        setPlacesByDay({ 1: fetchedPlaces });
      } catch (err) {
        console.error("플랜 로딩 중 문제 발생:", err);
      }
    };

    fetchExistingTrip();
  }, [editTripId, userId]);

  // 모달창에서 장소를 선택했을 때 새 장소를 현재 날짜(Day) 탭에 추가하는 함수
  const handleAddPlace = (
    kakao_place_id: string,
    lat: number,
    lng: number,
    name: string,
    category: string,
    address: string,
  ) => {
    const newPlace: Place = {
      id: Date.now().toString(),
      kakao_place_id,
      name,
      category,
      address,
      lat,
      lng,
    }
    setPlacesByDay((prev) => ({
      ...prev,
      [currentDay]: [...(prev[currentDay] || []), newPlace],
    }))
  }

  const handleReorderPlaces = (startIndex: number, endIndex: number) => {
    setPlacesByDay((prev) => {
      const dayPlaces = Array.from(prev[currentDay] || [])
      const [removed] = dayPlaces.splice(startIndex, 1)
      dayPlaces.splice(endIndex, 0, removed)
      return { ...prev, [currentDay]: dayPlaces }
    })
  }

  const handleDeletePlace = (id: string) => {
    setPlacesByDay((prev) => ({
      ...prev,
      [currentDay]: (prev[currentDay] || []).filter((p) => p.id !== id),
    }))
  }

  const [isSaving, setIsSaving] = useState(false)

  // 하드코딩 정보 대신 모달에서 쏴준 데이터(title, startDate, endDate, isPublic)를 파라미터로 받음
  const handleSaveTrip = async (
    title: string,
    startDate: string,
    endDate: string,
    isPublic: boolean,
  ) => {
    if (!userId) {
      alert('로그인이 필요합니다.')
      return
    }

    const totalPlacesCount = Object.values(placesByDay).flat().length

    if (totalPlacesCount === 0) {
      alert('여행 장소를 전체 Day 통틀어 1개 이상 추가해주세요!')
      return
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      let tripId = editTripId; // 이미 URL 파라미터가 있다면 수정을 의미함
      
      if (!editTripId) {
        // [CREATE] 새 일정 만들기: trips 테이블에 Insert
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .insert({
            user_id: userId,
            title: title, 
            start_date: startDate, 
            end_date: endDate,
            is_public: isPublic
          })
          .select()
          .single();
          
        if (tripError || !tripData) {
          throw new Error(tripError?.message || "플랜 생성 실패");
        }
        tripId = tripData.id;
      } else {
        // [UPDATE] 기존 일정 수정하기: trips 정보 Update
        const { error: tripError } = await supabase
          .from('trips')
          .update({
            title: title, 
            start_date: startDate, 
            end_date: endDate,
            is_public: isPublic
          })
          .eq('id', editTripId)
          .eq('user_id', userId);

        if (tripError) throw new Error("플랜 수정 실패");
        
        // 플랜이 수정될 때, 타임라인 순서가 꼬이는 것을 막기 위해 기존 trip_items를 전부 날리고 새로 Insert 합니다. (가장 깔끔한 싱크 방식)
        await supabase.from('trip_items').delete().eq('trip_id', editTripId);
      }
      
      let globalOrder = 1; // n박 m일을 한줄로 이어붙여서 순서를 매김 (추후 trip_items에 visit_day 컬럼 확장을 고려하면 좋습니다)

      // 2. places 테이블 업데이트(Upsert 성격) 후 trip_items 연결
      for (const dayStr of Object.keys(placesByDay)) {
        const dayPlaces = placesByDay[parseInt(dayStr)]

        for (let i = 0; i < dayPlaces.length; i++) {
          const place = dayPlaces[i]
          let dbPlaceId: number | null = null

          // 검색을 통해 추가된 정상적인 장소(kakao_place_id 보장)만 처리
          if (place.kakao_place_id) {
            // 2-1 DB에 이미 이 카카오 장소가 들어있는지 검색 (중복 방지)
            const { data: existingPlace } = await supabase
              .from('places')
              .select('id')
              .eq('kakao_place_id', place.kakao_place_id)
              .maybeSingle()

            if (existingPlace) {
              dbPlaceId = existingPlace.id
            } else {
              // 없다면 새로 places 테이블에 Insert
              const { data: newPlace, error: placeError } = await supabase
                .from('places')
                .insert({
                  kakao_place_id: place.kakao_place_id,
                  place_name: place.name,
                  category: place.category,
                  latitude: place.lat,
                  longitude: place.lng,
                  is_near_station: false,
                })
                .select('id')
                .single()

              if (newPlace) dbPlaceId = newPlace.id
            }
          } else {
            // (더미용 데이터 건너뛰기)
            console.warn(
              `장소 [${place.name}]는 카카오 ID가 없어 제외되었습니다.`,
            )
          }

          // 2-2 trip_items(교차 테이블)에 일정 순서 정보를 연결지어 Insert
          if (dbPlaceId) {
            await supabase.from('trip_items').insert({
              trip_id: tripId,
              place_id: dbPlaceId,
              visit_order: globalOrder++, // Day 상관없이 전역 순서체계 사용
              transport_type: 'bus', // 이동수단 기본값
              travel_time: 15, // 소요시간 기본값
            })
          }
        }
      }

      alert('플랜이 성공적으로 데이터베이스에 저장되었습니다!')
    } catch (error) {
      console.error(error)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // 모든 훅 선언이 끝난 뒤에 로딩 방어화면을 렌더링해야 React 훅 에러가 나지 않습니다.
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center flex-col gap-4">
        {/* 부드러운 스피너와 로딩 안내 메세지로 깜빡임(FOUC) 방어 */}
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">
          인증 정보를 확인하는 중입니다...
        </p>
      </div>
    )
  }

  // 렌더링에 사용할 현재 선택된 Day의 장소 배열
  const currentPlaces = placesByDay[currentDay] || []

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* 팝업 오버레이 조건부 렌더링 */}
      {isSearchOpen && (
        <PlaceSearchModal
          onClose={() => setIsSearchOpen(false)}
          onSelect={(kakaoId, lat, lng, name, category, addr) => {
            handleAddPlace(kakaoId, lat, lng, name, category, addr)
            setIsSearchOpen(false) // 완추가 후 모달 자동 닫기
          }}
        />
      )}
      <GlobalHeader />

      {/* 내 일정 서랍형 사이드바 (Sidebar) */}
      <MyTripsSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        userId={userId}
        currentTripId={editTripId}
        onSelectTrip={handleSelectTrip}
      />

      {/* 저장 전 필수 정보 입력 팝업창 띄우기 (Save Modal) */}
      {isSaveModalOpen && (
        <SaveTripModal
          onClose={() => setIsSaveModalOpen(false)}
          onSave={handleSaveTrip}
        />
      )}

      <PageContainer className="flex-1 py-8">
        {/* 상단 헤더 영역 */}
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-start w-full mb-3">
            <div className="flex items-center gap-4">
              <h1 className="text-[22px] font-bold text-gray-900 flex items-center gap-3">
                여행 일정 플래너
                {/* 내 일정 목록 (사이드바 여는 버튼) */}
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all flex items-center gap-1.5 shadow-sm ml-2"
                >
                  <FolderOpen className="w-4 h-4 flex-shrink-0" /> <span className="hidden sm:inline">내 보관함</span>
                </button>
              </h1>
              <div className="flex items-center gap-2">
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] flex items-center gap-1.5 rounded-full">
                  <Calendar className="w-3 h-3 text-gray-500" /> 6월 14일 (토)
                </FilterBadge>
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] flex items-center gap-1.5 rounded-full">
                  <MapPin className="w-3 h-3 text-gray-500" /> 경주
                </FilterBadge>
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] rounded-full">
                  Day {currentDay}
                </FilterBadge>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-400">
              <button className="p-1 hover:text-gray-900 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-1 hover:text-gray-900 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {/* 곧바로 저장(handleSaveTrip)을 호출하지 않고 팝업(Modal) 상태를 켭니다. */}
              <CommonButton
                onClick={() => setIsSaveModalOpen(true)}
                disabled={isSaving || isSaveModalOpen}
                className="!bg-purple-600 !text-white hover:!bg-purple-700 !rounded-lg px-4 py-2 flex items-center gap-2 text-[13px] font-semibold border-none ml-2 shadow-sm transition-all"
              >
                {isSaving ? '저장 중...' : '일정 저장하기'}
              </CommonButton>
            </div>
          </div>

          <div className="mb-2">
            <CommonButton className="!bg-gray-900 !text-white hover:!bg-gray-800 !rounded-lg px-4 py-2 flex items-center gap-2 text-xs border-none">
              <Sparkles className="w-3.5 h-3.5" /> AI 동선 최적화
            </CommonButton>
          </div>
        </div>

        {/* 본문 영역: 좌측 지도, 우측 타임라인 */}
        <div className="flex flex-col lg:flex-row w-full gap-8 h-[calc(100vh-240px)] min-h-[600px]">
          {/* 좌측 지도 패널: 현재 탭(currentPlaces)의 장소들만 렌더링 */}
          <div className="w-full lg:w-[55%] xl:w-[60%] h-[400px] lg:h-full relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
            <ItineraryMap places={currentPlaces} />
          </div>

          {/* 우측 타임라인 패널 */}
          <div className="w-full lg:w-[45%] xl:w-[40%] h-full flex flex-col relative pr-2">
            {/* Day 탭 네비게이션 UI */}
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide pt-1 px-1">
              {Object.keys(placesByDay).map((dayStr) => {
                const day = parseInt(dayStr)
                return (
                  <button
                    key={day}
                    onClick={() => setCurrentDay(day)}
                    className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all shadow-sm ${
                      currentDay === day
                        ? 'bg-purple-600 text-white border-transparent'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Day {day}
                  </button>
                )
              })}
              <button
                onClick={() =>
                  setPlacesByDay((prev) => {
                    const nextDay =
                      Math.max(...Object.keys(prev).map(Number)) + 1
                    return { ...prev, [nextDay]: [] }
                  })
                }
                className="px-4 py-2 rounded-full text-[13px] font-bold bg-gray-50 border border-dashed border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-700 whitespace-nowrap transition-colors flex items-center gap-1"
                title="새로운 여행 날짜 탭 추가"
              >
                + Day 추가
              </button>
            </div>

            <TimelineList
              places={currentPlaces}
              onReorder={handleReorderPlaces}
              onDelete={handleDeletePlace}
              onOpenSearch={() => setIsSearchOpen(true)}
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

// Next.js App Router 환경에서 useSearchParams()를 쓰는 컴포넌트는 전부 Suspense로 감싸주어야 합니다.
export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
      <PlanPageContent />
    </Suspense>
  );
}
