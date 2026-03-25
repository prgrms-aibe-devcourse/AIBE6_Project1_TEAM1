'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Plus, Minus, LocateFixed } from 'lucide-react'

export default function ItineraryMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [debugMsg, setDebugMsg] = useState<string>('지도 로딩 대기중...')

  const initMap = () => {
    if (!window.kakao) {
      setDebugMsg('❗ 오류: 카카오 스크립트는 불러왔으나 kakao 객체가 없습니다.')
      return
    }

    if (!window.kakao.maps) {
      setDebugMsg('❗ 오류: kakao 객체는 있으나 maps 객체가 없습니다. (앱키 오류 가능성)')
      return
    }

    window.kakao.maps.load(() => {
      try {
        if (!mapContainer.current) {
          setDebugMsg('❗ 오류: 지도를 그릴 HTML 컨테이너를 찾지 못했습니다.')
          return
        }

        const options = {
          center: new window.kakao.maps.LatLng(35.834710, 129.227284),
          level: 4,
        }

        new window.kakao.maps.Map(mapContainer.current, options)
        setDebugMsg('') // 성공 시 디버그 메시지 숨김
      } catch (err: any) {
        setDebugMsg('❗ 지도 렌더링 중 에러 발생: ' + err.message)
      }
    })
  }

  // 다른 페이지에 갔다 왔을 때 스크립트가 이미 로드되어 있는 경우 대비
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap()
    }
  }, [])

  return (
    <>
      {/* Script: onLoad 프롭스를 이용해 로딩 완료 후 지도를 렌더링합니다 */}
      <Script
        strategy="afterInteractive"
        // 프로토콜을 명확하게 https로 지정
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false`}
        onLoad={initMap}
        onError={() => setDebugMsg('❗ 오류: 카카오 API 스크립트 파일을 다운로드하지 못했습니다. (네트워크 401 권한 오루 또는 키/도메인 문제)')}
      />

      <div className="w-full h-full relative bg-[#f4f4f5]">
        
        {/* 디버그 메시지 발생 시 한가운데 큰 빨간 글씨로 띄움 */}
        {debugMsg && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
              <h3 className="text-red-600 font-bold mb-2">지도 로드 실패</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{debugMsg}</p>
            </div>
          </div>
        )}

        {/* 백그라운드에 깔리는 실제 카카오 맵 영역 */}
        <div ref={mapContainer} className="absolute inset-0 z-0 bg-transparent" />

        {/* 줌 컨트롤 (우측 상단) */}
        <div className="absolute top-4 right-4 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden z-20">
          <button className="p-2 hover:bg-gray-50 border-b border-gray-200 transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-50 transition-colors">
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 현재 위치 (좌측 하단) */}
        <div className="absolute bottom-4 left-4 z-20">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-[11px] font-semibold text-gray-600 rounded-md border border-gray-200 shadow-sm transition-colors">
            <LocateFixed className="w-3 h-3" /> 현재 위치
          </button>
        </div>

        {/* 와이어프레임 더미 핀들 */}
        <div className="absolute top-[30%] left-[20%] w-6 h-6 bg-gray-900 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">1</div>
        <div className="absolute top-[45%] left-[45%] w-6 h-6 bg-gray-900 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">2</div>
        <div className="absolute top-[50%] left-[65%] w-6 h-6 bg-[#27272a] rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">3</div>
        <div className="absolute top-[35%] left-[80%] w-6 h-6 bg-[#27272a] rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">4</div>
        <div className="absolute top-[65%] left-[30%] w-6 h-6 bg-[#27272a] rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md z-20">5</div>
      </div>
    </>
  )
}
