"use client";

import { removeMediaFile, uploadSingleImage } from "@/utils/mediaUploader";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Camera, User } from "lucide-react";
import { useModalStore } from "@/store/useModalStore";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ProfileEditForm({ user, profile }: any) {
  const router = useRouter();
  const supabase = createClient();
  
  // 파일 입력창을 가려두고, 프로필 이미지를 클릭했을 때 파일 창이 뜨도록 연결해주는 리액트 참조(Ref)입니다.
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const [isLoading, setIsLoading] = useState(false); 
  
  // ---- 프로필 정보 관련된 상태들 ----
  const [nickname, setNickname] = useState(profile?.nickname || ""); // 입력된 닉네임 (처음엔 DB값으로 채움)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || ""); // 기존 DB에 저장된 아바타 사진 주소
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 스마트폰 앨범에서 선택한 사진의 미리보기 주소
  const [avatarFile, setAvatarFile] = useState<File | null>(null); // 실제로 업로드할 이미지 파일 자체
  
  // ---- 비밀번호 변경 관련된 상태들 ----
  const [currentPassword, setCurrentPassword] = useState(""); // 현재 비밀번호 
  const [newPassword, setNewPassword] = useState(""); // 바꿀 새 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(""); // 새 비밀번호 한 번 더 확인

  // 이메일로 가입한 유저인지 확인하는 상태
  const isEmailUser = user?.app_metadata?.provider === "email";

  // 사용자가 새로운 프로필 사진을 앨범에서 선택했을 때 실행되는 함수입니다.
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 파일이 정상적으로 선택되었는지 확인합니다
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file); // 실제 파일을 상태에 저장합니다 (나중에 DB 저장 버튼을 누를 때 진짜로 올리기 위해)
      setPreviewUrl(URL.createObjectURL(file)); // 화면에 즉시 보여주기 위한 가짜 주소(미리보기용)를 만듭니다.
    }
  };

  // 우측 상단 '저장' 버튼을 눌렀을 때 실행되는 핵심 함수입니다!
  const handeSubmit = async () => {
    setIsLoading(true); // 우선 뱅글뱅글 로딩부터 켜줍니다 (여러 번 클릭하는 것 방지)
    
    let finalAvatarUrl = avatarUrl; // 최종적으로 DB에 저장할 이미지 주소 (일단 기존 주로소 세팅)
    
    // 1단계: 만약 사용자가 새로운 앨범 사진(avatarFile)을 선택했다면?
    if (avatarFile) {
      // 👉 기존 프로필 사진이 있었다면, 스토리지 용량 낭비를 막기 위해 예전 사진을 먼저 지워줍니다.
      if (avatarUrl) {
        // "https://.../avatars/아무이름.png" 주소에서 맨 뒤의 파일명만 딱 잘라옵니다.
        const oldFileName = avatarUrl.split('/').pop(); 
        if (oldFileName) {
          // 아까 만들어둔 삭제 함수 재활용!
          await removeMediaFile(oldFileName, 'profileImages'); 
        }
      }

      // mediaUploader.ts 의 단일 이미지 업로드 함수 사용하기!
      const uploadResult = await uploadSingleImage(avatarFile, user.id, 'profileImages');
      
      if (uploadResult) {
        finalAvatarUrl = uploadResult.url; // 성공 시 받아온 URL을 최종 URL로 설정
      } else {
        setIsLoading(false);
        return; // 실패 시 함수 멈춤
      }
    }

    // 2단계: 'profiles' 데이터베이스 테이블에 변경된 닉네임과 새 이미지 주소를 업데이트합니다.
    if (nickname || finalAvatarUrl !== avatarUrl) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nickname, avatar_url: finalAvatarUrl }) // 변경된 정보 전송
        .eq('id', user.id); // 조건: "지금 로그인한 내(user.id) 정보만 바꿔줘!"
        
      if (profileError) {
        console.error(profileError);
      }
    }

    // 3단계: 비밀번호 입력창에 무언가를 적었다면, 비밀번호 변경을 시도합니다.
    if (newPassword && confirmPassword) {
      // 새 비밀번호 두 개가 똑같은지 비교
      if (newPassword !== confirmPassword) {
        alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
        return; // 일치하지 않으면 바로 함수를 멈춥니다 (저장 실패)
      }
      
      // 일치한다면 Supabase Auth 쪽에 내 비밀번호를 새걸로 바꿔달라고 요청합니다.
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (passwordError) {
        alert("비밀번호 변경 실패: " + passwordError.message);
      }
    }

    // 위 1,2,3 단계 작업이 모두 성공적으로 끝났다면, 로딩을 끄고 마이페이지 화면으로 돌아갑니다.
    setIsLoading(false);
    alert("소중한 프로필 정보가 성공적으로 업데이트 되었습니다! 🎉");
    router.push("/mypage"); // 마이페이지 홈으로 강제 이동
    router.refresh(); // 최신 프로필 사진과 닉네임이 반영되도록 전체 리프레시를 한 번 시켜줍니다.
  };

  // 화면에 보여줄 사진을 결정합니다: 방금 막 선택한 미리보기용(previewUrl)이 있다면 그걸 먼저 보여주고, 없다면 DB에 저장되어있던 사진(avatarUrl)을 보여줍니다.
  const currentDisplayAvatar = previewUrl || avatarUrl;

  // 회원 탈퇴 처리를 수행하는 함수입니다.
  const handleWithdraw = () => {
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
        {/* 1️⃣ 프로필 사진 수정(Avatar Edit) 섹션 */}
        {/* 설명: 사용자가 동그란 프로필 사진 영역을 클릭(onClick)하면 숨겨져 있는 파일 입력창(fileInputRef)이 대신 클릭된 것처럼 이벤트를 전달합니다. */}
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
          {/* 진짜로 파일을 입력받는 창입니다. className="hidden" 이라 화면에는 안보이지만, onClick 등으로 연결되어 몰래 열립니다. */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" // 스마트폰 앨범에서 이미지만 고를 수 있게 제한
            className="hidden" 
          />
        </div>

        <div className="w-full space-y-8">
          {/* 2️⃣ 닉네임(Nickname) 섹션 */}
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
          {isEmailUser && (   
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
          </div>)}
        </div>
        

        {/* Action Bottom */}
        <div className="mt-16 mb-8 text-center w-full">
          <button 
            type="button"
            onClick={handleWithdraw}
            className="text-[13px] font-medium text-gray-400 hover:text-red-500 transition-colors border-b border-gray-400 hover:border-red-500 pb-0.5"
          >
              회원 탈퇴
          </button>
        </div>
      </main>
    </div>
  );
}
