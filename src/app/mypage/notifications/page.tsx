"use client";

import { Bell, ChevronLeft, Moon, Smartphone, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NotificationsPage() {
  const [settings, setSettings] = useState({
    tripReminders: true,
    communityAlerts: true,
    marketing: false,
    nightMode: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingRow = ({ 
    icon: Icon, 
    title, 
    description, 
    isActive, 
    onToggle 
  }: { 
    icon: any; 
    title: string; 
    description: string; 
    isActive: boolean; 
    onToggle: () => void;
  }) => (
    <div className="flex items-center justify-between py-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-4 -mx-4 rounded-xl">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-bold text-gray-900">{title}</span>
          <span className="text-[13px] text-gray-400 leading-snug">{description}</span>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isActive ? "bg-purple-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isActive ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/mypage" 
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">알림 설정</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-[13px] font-bold text-purple-600 uppercase tracking-wider">주요 알림 제어</h2>
          <p className="text-[14px] text-gray-500 font-medium">서비스 이용에 필요한 알림들을 설정해보세요.</p>
        </div>

        <section className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
          <div className="flex flex-col">
            <SettingRow
              icon={Smartphone}
              title="여행 일정 리마인드"
              description="다가오는 여행과 일정 확인을 위한 알림을 받아요."
              isActive={settings.tripReminders}
              onToggle={() => toggleSetting("tripReminders")}
            />
            <SettingRow
              icon={Star}
              title="커뮤니티 활동"
              description="내 리뷰에 대한 반응이나 댓글 알림을 받아요."
              isActive={settings.communityAlerts}
              onToggle={() => toggleSetting("communityAlerts")}
            />
            <SettingRow
              icon={Bell}
              title="혜택 및 마케팅 알림"
              description="이벤트 정보와 맞춤 추천 소식을 받아요."
              isActive={settings.marketing}
              onToggle={() => toggleSetting("marketing")}
            />
            <SettingRow
              icon={Moon}
              title="야간 알림 제한"
              description="오후 9시부터 오전 8시까지 알림을 받지 않아요."
              isActive={settings.nightMode}
              onToggle={() => toggleSetting("nightMode")}
            />
          </div>
        </section>

        <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-start gap-4">
            <Bell className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-2">
              <span className="text-[14px] font-bold text-gray-700">기기 알림 설정 안내</span>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                앱의 전체 알림을 끄거나 켜려면 기기의 시스템 설정에서 '알림' 메뉴를 확인해주세요.
                차단된 알림은 다시 켜기 전까지 전송되지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
