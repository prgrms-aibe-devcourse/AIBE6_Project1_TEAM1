"use client";

import { useModalStore } from "@/store/useModalStore";
import { createClient } from "@/utils/supabase/client";
import { ChevronLeft, ChevronRight, Globe, Info, LogOut, Moon, Shield, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("System");
  const [language, setLanguage] = useState("한국어");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    // 초기 테마 로드
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [supabase]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleWithdraw = () => {
    if (!user) return;
    
    // 실수 방지를 위해 전역 모달을 띄워 한 번 더 물어봅니다.
    useModalStore.getState().openModal({
      type: "confirm",
      variant: "danger",
      title: "정말로 탈퇴하시겠습니까? 😢",
      description: `탈퇴하시면 모든 데이터가 삭제되며 복구할 수 없습니다.\n확인을 위해 본인의 이메일 뒤에 /delete를 붙여 입력해 주세요.\n(예: ${user.email}/delete)`,
      inputPlaceholder: "이메일/delete 를 입력하세요",
      requiredInputText: `${user.email}/delete`, // 이 텍스트와 똑같이 입력해야 버튼이 활성화됩니다.
      confirmText: "탈퇴하기",
      cancelText: "취소",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const res = await fetch("/api/auth/withdraw", { method: "POST" });
          if (res.ok) {
            alert("그동안 뚜벅을 이용해 주셔서 감사합니다. 안녕히 가세요!");
            // 로그아웃 처리 후 홈으로 이동
            await supabase.auth.signOut();
            router.push("/");
            router.refresh();
          } else {
            const data = await res.json();
            alert("탈퇴 처리 중 오류가 발생했습니다: " + data.error);
          }
        } catch (error) {
          alert("네트워크 오류로 탈퇴 처리에 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    value, 
    href, 
    onClick,
    isToggle = false,
    isActive = false,
    onToggle,
    isDestructive = false 
  }: { 
    icon: any; 
    title: string; 
    value?: string; 
    href?: string;
    onClick?: () => void;
    isToggle?: boolean;
    isActive?: boolean;
    onToggle?: () => void;
    isDestructive?: boolean;
  }) => {
    const content = (
      <div className={`flex items-center justify-between py-5 px-4 rounded-2xl transition-all ${
        isDestructive ? "hover:bg-red-50 dark:hover:bg-red-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDestructive ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={`text-[15px] font-bold ${isDestructive ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isToggle ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.();
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          ) : (
            <>
              {value && <span className="text-[14px] text-gray-400 dark:text-gray-500 font-medium">{value}</span>}
              <ChevronRight className={`w-5 h-5 ${isDestructive ? "text-red-300 dark:text-red-800" : "text-gray-300 dark:text-gray-700"}`} />
            </>
          )}
        </div>
      </div>
    );

    if (href) return <Link href={href}>{content}</Link>;
    
    return (
      <div 
        onClick={isToggle ? onToggle : onClick} 
        className={`w-full ${(onClick || isToggle) ? "cursor-pointer" : ""}`}
        role="button"
        tabIndex={(onClick || isToggle) ? 0 : -1}
      >
        {content}
      </div>
    );
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[13px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-4 mb-2 mt-8">
      {children}
    </h2>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-20 transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-900">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-4">
          <Link 
            href="/mypage" 
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">앱 설정</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-2 pt-6">
        {/* Account Section */}
        <SectionTitle>계정 관리</SectionTitle>
        <div className="flex flex-col">
          <SettingItem
            icon={User}
            title="프로필 편집"
            href="/mypage/settings/edit"
          />
        </div>

        {/* Preferences Section */}
        <SectionTitle>앱 설정</SectionTitle>
        <div className="flex flex-col">
          <SettingItem
            icon={Moon}
            title="다크 모드"
            isToggle={true}
            isActive={mounted && theme === "dark"}
            onToggle={toggleTheme}
          />
          <SettingItem
            icon={Globe}
            title="언어 설정"
            value={language}
          />
        </div>

        {/* Info Section */}
        <SectionTitle>정보 및 지원</SectionTitle>
        <div className="flex flex-col">
          <SettingItem
            icon={Info}
            title="버전 정보"
            value="v1.2.0"
          />
          <SettingItem
            icon={Shield}
            title="오픈소스 라이선스"
          />
          <SettingItem
            icon={Info}
            title="이용약관 및 개인정보 처리방침"
          />
        </div>

        {/* More Section */}
        <SectionTitle>기타</SectionTitle>
        <div className="flex flex-col">
          <SettingItem
            icon={LogOut}
            title="로그아웃"
            onClick={() => supabase.auth.signOut().then(() => router.push("/"))}
          />
          <SettingItem
            icon={Trash2}
            title="계정 탈퇴"
            isDestructive={true}
            onClick={handleWithdraw}
          />
        </div>

        {/* Copyright */}
        <div className="mt-12 mb-8 text-center px-4">
          <p className="text-[12px] text-gray-300 dark:text-gray-700 font-medium leading-relaxed">
            © 2026 Ddubuk Team. All rights reserved.<br />
            당신의 뚜벅거림이 새로운 여행이 됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
