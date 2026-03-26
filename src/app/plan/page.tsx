"use client";

import CommonButton from "@/components/domain/plan/CommonButton";
import FilterBadge from "@/components/domain/plan/FilterBadge";
import ItineraryMap from "@/components/domain/plan/ItineraryMap";
import PlaceSearchModal from "@/components/domain/plan/PlaceSearchModal";
import SaveTripModal from "@/components/domain/plan/SaveTripModal";
import TimelineList from "@/components/domain/plan/TimelineList";
import GlobalHeader from "@/components/layout/GlobalHeader";
import PageContainer from "@/components/layout/PageContainer";
import { Calendar, MapPin, MoreHorizontal, Share2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// 글로벌 공통 장소 데이터 구조
export interface Place {
  id: string;      
  kakao_place_id?: string; // DB(places)와 연결하기 위한 필수 식별 고유키
  name: string;    
  category: string;
  address: string; 
  lat: number;     
  lng: number;     
}

export default function PlanPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [places, setPlaces] = useState<Place[]>([
    { id: "1", name: "불국사", category: "관광", address: "경북 경주시 진현동 15", lat: 35.790104, lng: 129.332079 },
    { id: "2", name: "석굴암", category: "관광", address: "경북 경주시 불국로 873-243", lat: 35.794939, lng: 129.349141 },
  ]);
  
  // 모달창 on/off 상태 관리
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false); // 저장 모달 관리를 위해 신규 추가

  // 인증 검사 로직 (마운트 시점 1회 실행)
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // 비회원이면 뒤로가기 불가능한 대체(replace) 방식으로 로그인 창 이동
        router.replace("/login");
      } else {
        // 회원이면 고유 ID 저장 후 로딩 해제
        setUserId(session.user.id);
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // 모달창에서 장소를 선택했을 때 새 장소를 추가하는 함수
  const handleAddPlace = (kakao_place_id: string, lat: number, lng: number, name: string, category: string, address: string) => {
    const newPlace: Place = {
      id: Date.now().toString(), 
      kakao_place_id,
      name, 
      category, 
      address,
      lat,
      lng,
    };
    setPlaces((prev) => [...prev, newPlace]);
  };

  const handleReorderPlaces = (startIndex: number, endIndex: number) => {
    const newPlaces = Array.from(places); 
    const [removed] = newPlaces.splice(startIndex, 1); 
    newPlaces.splice(endIndex, 0, removed); 
    setPlaces(newPlaces); 
  };

  const handleDeletePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const [isSaving, setIsSaving] = useState(false);

  // 하드코딩 정보 대신 모달에서 쏴준 데이터(title, startDate, endDate, isPublic)를 파라미터로 받음
  const handleSaveTrip = async (title: string, startDate: string, endDate: string, isPublic: boolean) => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    if (places.length === 0) {
      alert("여행 장소를 1개 이상 추가해주세요!");
      return;
    }
    
    setIsSaving(true);
    try {
      const supabase = createClient();
      
      // 1. trips 테이블에 플랜(여행) 껍데기 생성 (Insert)
      // 모달창으로부터 받은 유저의 고유한 여행 메타데이터를 매핑
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
      const tripId = tripData.id;
      
      // 2. places 테이블 업데이트(Upsert 성격) 후 trip_items 연결
      for (let i = 0; i < places.length; i++) {
        const place = places[i];
        let dbPlaceId: number | null = null;
        
        // 검색을 통해 추가된 정상적인 장소(kakao_place_id 보장)만 처리
        if (place.kakao_place_id) {
          // 2-1 DB에 이미 이 카카오 장소가 들어있는지 검색 (중복 방지)
          const { data: existingPlace } = await supabase
            .from('places')
            .select('id')
            .eq('kakao_place_id', place.kakao_place_id)
            .maybeSingle();
            
          if (existingPlace) {
            dbPlaceId = existingPlace.id;
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
                is_near_station: false 
              })
              .select('id')
              .single();
              
            if (newPlace) dbPlaceId = newPlace.id;
          }
        } else {
          // (더미용 데이터 건너뛰기)
          console.warn(`장소 [${place.name}]는 카카오 ID가 없어 제외되었습니다.`);
        }
        
        // 2-2 trip_items(교차 테이블)에 일정 순서 정보를 연결지어 Insert (memo 제외)
        if (dbPlaceId) {
          await supabase.from('trip_items').insert({
            trip_id: tripId,
            place_id: dbPlaceId,
            visit_order: i + 1, // 카드 순서대로 1번부터 매핑
            transport_type: "bus", // 이동수단 기본값
            travel_time: 15 // 소요시간 기본값
          });
        }
      }
      
      alert("플랜이 성공적으로 데이터베이스에 저장되었습니다!");
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 모든 훅 선언이 끝난 뒤에 로딩 방어화면을 렌더링해야 React 훅 에러가 나지 않습니다.
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center flex-col gap-4">
        {/* 부드러운 스피너와 로딩 안내 메세지로 깜빡임(FOUC) 방어 */}
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">인증 정보를 확인하는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* 팝업 오버레이 조건부 렌더링 */}
      {isSearchOpen && (
        <PlaceSearchModal 
          onClose={() => setIsSearchOpen(false)} 
          onSelect={(kakaoId, lat, lng, name, category, addr) => {
            handleAddPlace(kakaoId, lat, lng, name, category, addr);
            setIsSearchOpen(false); // 완추가 후 모달 자동 닫기
          }} 
        />
      )}
      <GlobalHeader />

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
              <h1 className="text-[22px] font-bold text-gray-900">여행 일정 플래너</h1>
              <div className="flex items-center gap-2">
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] flex items-center gap-1.5 rounded-full">
                  <Calendar className="w-3 h-3 text-gray-500" /> 6월 14일 (토)
                </FilterBadge>
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] flex items-center gap-1.5 rounded-full">
                  <MapPin className="w-3 h-3 text-gray-500" /> 경주
                </FilterBadge>
                <FilterBadge className="!bg-gray-100 !text-gray-700 hover:!bg-gray-200 border-none font-medium !px-3 !py-1 !text-[11px] rounded-full">
                  Day 1
                </FilterBadge>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-400">
              <button className="p-1 hover:text-gray-900 transition-colors"><Share2 className="w-5 h-5" /></button>
              <button className="p-1 hover:text-gray-900 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
              {/* 곧바로 저장(handleSaveTrip)을 호출하지 않고 팝업(Modal) 상태를 켭니다. */}
              <CommonButton 
                onClick={() => setIsSaveModalOpen(true)} 
                disabled={isSaving || isSaveModalOpen}
                className="!bg-purple-600 !text-white hover:!bg-purple-700 !rounded-lg px-4 py-2 flex items-center gap-2 text-[13px] font-semibold border-none ml-2 shadow-sm transition-all"
              >
                {isSaving ? "저장 중..." : "일정 저장하기"}
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
          
          {/* 좌측 지도 패널: places 배열만을 넘기기 (클릭은 삭제) */}
          <div className="w-full lg:w-[55%] xl:w-[60%] h-[400px] lg:h-full relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
            <ItineraryMap places={places} />
          </div>

          {/* 우측 타임라인 패널: 검색 모달 onOpenSearch 함수 연결 */}
          <div className="w-full lg:w-[45%] xl:w-[40%] h-full flex flex-col relative pr-2">
            <TimelineList 
              places={places} 
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
