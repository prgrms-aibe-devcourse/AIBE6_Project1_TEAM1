import { useModalStore } from "@/store/useModalStore";
import { createClient } from "./supabase/client";

/**
 * 선택된 파일들을 Supabase Storage에 업로드하고, 업로드된 파일들의 URL과 경로(path)를 반환합니다.
 * 
 * @param files - input 태그를 통해 선택된 FileList (다중 선택 가능)
 * @param bucketName - 데이터를 업로드할 스토리지 버킷 이름 (기본값: 'media-storage')
 * @returns 업로드 완료된 이미지들의 정보를 담은 배열 (예: [{ url: "...", path: "..." }])
 */
export const uploadMediaFiles = async (
  files: FileList | null,
  bucketName: string = "media-storage"
): Promise<{ url: string; path: string }[]> => { // : Promise<{ url: string; path: string }[]> => 여기도 함수가 최종적으로 돌려줄 결과물의 형태(타입)를 엄격하게 미리 선언해 두는 부분입니다. []: 그리고 그런 객체들이 여러 개 담겨있는 배열(Array) 형태여야 한다는 뜻입니다. (여러 장의 사진을 올릴 수 있으니까요)
  // 1. 업로드할 파일이 없으면 빈 배열 반환
  if (!files || files.length === 0) return [];

  // 2. 브라우저 환경에서 사용할 Supabase 클라이언트 생성
  const supabase = createClient();
  const uploadedUrls: { url: string; path: string }[] = [];

  // 3. FileList는 유사 배열이므로 Array.from()을 사용해 배열로 변환한 뒤 순회
  for (const file of Array.from(files)) {
    // 파일의 확장자 추출 (예: image.png -> png)
    const fileExt = file.name.split(".").pop();
    
    // 파일명이 겹치지 않도록 UUID와 확장자를 조합하여 고유한 파일명 생성
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // 4. 지정된 버킷명(`bucketName`)에 파일 업로드 진행
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    // 업로드 중 에러가 발생한 경우 (용량 초과, 형식 오류 등)
    if (error) {
      console.error("업로드 에러:", error);
      useModalStore.getState().openModal({
        type: "alert",
        variant: "danger",
        title: "업로드 실패",
        description: "파일 형식 및 용량을 확인해주세요.",
      });
      continue; // 에러가 난 파일은 건너뛰고 다음 파일 업로드를 계속 진행
    }

    // 5. 업로드 성공 시, 해당 파일에 접근할 수 있는 외부에 공개된 Public URL 가져오기
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // 6. 결과 배열에 URL과 경로(추후 삭제 시 필요)를 저장
    uploadedUrls.push({
      url: data.publicUrl,
      path: fileName, // 스토리지에 저장된 파일 고유명
    });
  }

  // 7. 성공적으로 업로드 완료된 파일들의 데이터 반환
  return uploadedUrls;
};

/**
 * Supabase Storage에서 특정 파일을 삭제합니다.
 * 
 * @param path - 삭제할 파일의 경로 (파일명)
 * @param bucketName - 삭제할 버킷명 (기본값: 'media-storage')
 * @returns 삭제가 정상적으로 완료되었는지 여부 (true/false)
 */
export const removeMediaFile = async (
  path: string, 
  bucketName: string = "media-storage"
): Promise<boolean> => {
  // 1. 브라우저 환경에서 사용할 Supabase 클라이언트 생성
  const supabase = createClient();

  // 2. 전달받은 해당 버킷명에서 파일 삭제
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  // 삭제 중 에러 발생 시 처리
  if (error) {
    console.error("삭제 에러:", error);
    useModalStore.getState().openModal({
      type: "alert",
      variant: "danger",
      title: "삭제 실패",
      description: "미디어 파일 삭제에 실패했습니다.",
    });
    return false;
  }

  // 삭제 성공 시 true 반환
  return true;
};

/**
 * 프로필 사진 등 단일 이미지 파일을 Supabase Storage에 업로드합니다.
 * 
 * @param file - 선택된 단편 File 객체
 * @param userId - 파일명 중복 방지를 위한 유저 고유 ID
 * @param bucketName - 사용할 버킷 이름 (기본값: 'avatars')
 * @returns 업로드된 이미지의 URL과 고유 경로 (실패 시 null 반환)
 */
export const uploadSingleImage = async (
  file: File | null,
  userId: string,
  bucketName: string = "profileImages"
): Promise<{ url: string; path: string } | null> => {
  // 1. 업로드할 파일이 없으면 취소
  if (!file) return null;

  // 2. Supabase 클라이언트 생성
  const supabase = createClient();
  
  // 3. 파일 확장자 추출 후, 유저 ID를 활용하여 고유한 파일명 생성
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;

  // 4. 지정된 버킷('avatars')에 이미지 업로드 (이미 동일한 이름이 있으면 덮어쓰기 upsert: true)
  const { data: uploadData, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.error("프로필 업로드 에러:", error);
    useModalStore.getState().openModal({
      type: "alert",
      variant: "danger",
      title: "업로드 실패",
      description: "이미지 업로드에 실패했습니다. (버킷 설정을 확인해주세요)",
    });
    return null;
  }

  // 5. 성공적으로 올라갔다면 외부에 공개된 Public URL 가져오기
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(uploadData.path);

  // 6. 결과 반환
  return {
    url: data.publicUrl,
    path: fileName,
  };
};
