"use client";

import { Place } from "@/app/plan/page";
import { LocateFixed, Minus, Plus } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface ItineraryMapProps {
  places: Place[];
}

export default function ItineraryMap({ places }: ItineraryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); // 실제 카카오맵 객체 백업
  const markersRef = useRef<any[]>([]);  // 지도에 그린 커스텀 오버레이 핀들 저장
  const polylineRef = useRef<any>(null); // 핀들을 잇는 보라색 선 저장
  
  const [debugMsg, setDebugMsg] = useState("");

  const initMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      setDebugMsg("❗ 카카오 객체 로드 실패");
      return;
    }

    window.kakao.maps.load(() => {
      try {
        if (!mapContainer.current) return;

        // 경주 부근 좌표 및 확대 레벨 설정
        const options = {
          center: new window.kakao.maps.LatLng(35.790104, 129.332079),
          level: 6, 
        };

        // 빈 컨테이너에 카카오 지도 객체 생성 및 부착
        mapInstance.current = new window.kakao.maps.Map(mapContainer.current, options);
        setDebugMsg(""); // 성공 시 숨김

        // 처음 세팅 후, 현재 가지고 있는 places 배열로 최초 핀 렌더링
        drawMarkersAndLines();

      } catch (err: any) {
        setDebugMsg("❗ 지도 렌더링 중 에러 발생: " + err.message);
      }
    });
  };

  // ✅ 타임라인 순서가 바뀌거나 추가/삭제될 때마다 지도 마커와 점선을 다시 예쁘게 그리는 함수
  const drawMarkersAndLines = () => {
    const map = mapInstance.current;
    if (!map || !window.kakao) return;

    // 1단계: 기존에 그려져 허공에 떠있던 낡은 마커들과 선 싹 다 지우기
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const linePath: any[] = []; // 지도 위의 핀들을 하나로 이을 좌표 선 묶음

    // 2단계: 최신 places 배열 안의 장소 좌표마다 진짜 카카오 커스텀 마커 생성
    places.forEach((place, index) => {
      const position = new window.kakao.maps.LatLng(place.lat, place.lng);
      linePath.push(position); // 선 묶음에 집어넣기

      // 와이어프레임과 똑같이 생긴 예쁜 디자인의 커스텀 넘버 버튼 핀 생성 (바닐라 HTML 텍스트)
      const content = `
        <div style="background-color: #111827; color: white; width: 24px; height: 24px; border-radius: 50%; font-family: sans-serif; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">
          ${index + 1}
        </div>
      `;
      
      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: content,
        yAnchor: 0.5 // 핀의 중앙이 좌표가 되게 조절
      });

      customOverlay.setMap(map); // 지도에 렌더링
      markersRef.current.push(customOverlay); // 다음에 지우기 위해 따로 배열에 저장
    });

    // 3단계: 장소가 2개 이상일 때 보라색 점선(Polyline) 그리기
    if (linePath.length > 1) {
      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 3, 
        strokeColor: '#9333ea', // 테일윈드의 purple-600 색상과 완벽하게 맞춤
        strokeOpacity: 0.8, 
        strokeStyle: 'dashed' // 점선
      });
      polyline.setMap(map);
      polylineRef.current = polyline;
    }
  };

  // ✅ 부모로부터 받아온 places 배열(장소 목록)이 바뀔 때마다 다시 그리기 트리거 작동!
  useEffect(() => {
    drawMarkersAndLines();
  }, [places]);


  // 만약 다른 페이지에 갔다 다시 왔는데 이미 window에 SDK가 받아져있다면 onLoad 대신 바로 실행합니다
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
    }
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        // ❗중요: 클릭한 곳의 역주소(지오코딩) 변환을 위해 끝부분에 &libraries=services 필수로 추가해야 합니다! 
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false&libraries=services`}
        onLoad={initMap}
        onError={() => setDebugMsg("❗ 오류: 카카오 API 스크립트 다운로드 불가")}
      />
      
      <div className="w-full h-full relative bg-[#f4f4f5]">
        
        {debugMsg && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
              <h3 className="text-red-600 font-bold mb-2">지도 로드 실패</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{debugMsg}</p>
            </div>
          </div>
        )}

        {/* 백그라운드에 깔리는 실제 렌더링되는 카카오 맵 영역 */}
        <div ref={mapContainer} className="absolute inset-0 z-0 bg-transparent" />

        {/* 줌 컨트롤 기능 추가 연동 필요 시 넣을 빈 껍데기 UI 그대로 유지 */}
        <div className="absolute top-4 right-4 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden z-20">
          <button className="p-2 hover:bg-gray-50 border-b border-gray-200 transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-50 transition-colors">
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 현재 위치로 Panning하는 로직 필요 시 넣을 껍데기 UI */}
        <div className="absolute bottom-4 left-4 z-20">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-600 rounded-md border border-gray-200 shadow-sm transition-colors">
            <LocateFixed className="w-3 h-3" /> 현재 위치
          </button>
        </div>

        {/* 기존의 가짜 핀 코드(절대위치 1,2,3,4,5)는 이제 동적 마커 렌더링으로 덮어씌워졌으니 깔끔하게 삭제했습니다! */}
      </div>
    </>
  );
}
