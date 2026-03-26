"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, User, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileEditForm({ user, profile }: any) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handeSubmit = async () => {
    setIsLoading(true);
    let finalAvatarUrl = avatarUrl;
    
    // 1. Upload new image if selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        alert("이미지 업로드에 실패했습니다. (버킷 설정을 확인해주세요)");
        console.error(uploadError);
      } else {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
        finalAvatarUrl = publicUrl;
      }
    }

    // 2. Update nickname & avatar_url in profiles table
    if (nickname || finalAvatarUrl !== avatarUrl) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nickname, avatar_url: finalAvatarUrl })
        .eq('id', user.id);
        
      if (profileError) {
        console.error(profileError);
      }
    }

    // 3. Update password if requested
    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
        return;
      }
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (passwordError) {
        alert("비밀번호 변경 실패: " + passwordError.message);
      }
    }

    setIsLoading(false);
    alert("소중한 프로필 정보가 성공적으로 업데이트 되었습니다! 🎉");
    router.push("/mypage");
    router.refresh();
  };

  const currentDisplayAvatar = previewUrl || avatarUrl;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">프로필 수정</h1>
        <button 
          onClick={handeSubmit} 
          disabled={isLoading}
          className="bg-gray-900 text-white text-[13px] font-bold px-4 py-2 rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "저장 중" : "저장"}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Avatar Edit Section */}
        <div className="relative mb-8 group cursor-pointer hover:scale-105 transition-transform" onClick={() => fileInputRef.current?.click()}>
          <div className="w-[100px] h-[100px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
            {currentDisplayAvatar ? (
               /* eslint-disable-next-line @next/next/no-img-element */
              <img src={currentDisplayAvatar} alt="아바타" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
            {/* 비유: 사진 변경 필터 이미지 느낌 - Hover 시 오버레이 */}
            <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center transition-all">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-2 shadow-sm">
            <Camera className="w-4 h-4 text-gray-700" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="w-full space-y-8">
          {/* Nickname Section */}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">닉네임</label>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2~10자 이내로 입력해주세요"
              maxLength={10}
              className="w-full h-14 px-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-[15px] text-gray-900 placeholder-gray-400"
            />
            <p className="mt-2 text-[11px] text-gray-400">뚜벅 세계에서 사용될 멋진 이름을 지어주세요!</p>
          </div>

          <hr className="border-gray-100" />

          {/* Password Security Section */}
          {/* 비유: 세 개의 튼튼한 금고 다이얼이 있는 패스워드 폼 */}
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-2">보안 설정 (비밀번호 변경)</label>
            <p className="mb-4 text-[11px] text-gray-400">안전한 로그인을 위해 주기적으로 비밀번호를 변경해 주세요.</p>
            <div className="space-y-3">
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호 (변경 시 필수)" 
                className="w-full h-14 px-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-[15px] placeholder-gray-400"
              />
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="어떤 멋진 새 비밀번호를 쓸까요?" 
                className="w-full h-14 px-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-gray-900 transition-shadow text-[15px] placeholder-gray-400"
              />
              <div className="relative">
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 다시 한 번!" 
                  className={`w-full h-14 px-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 transition-shadow text-[15px] placeholder-gray-400 ${
                    confirmPassword && confirmPassword !== newPassword ? "focus:ring-red-500 ring-2 ring-red-100" : "focus:ring-gray-900"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="mt-16 mb-8 text-center w-full">
          <button className="text-[13px] font-medium text-gray-400 hover:text-red-500 transition-colors border-b border-gray-400 hover:border-red-500 pb-0.5">
            뚜벅 로그아웃 및 회원 탈퇴
          </button>
        </div>
      </main>
    </div>
  );
}
