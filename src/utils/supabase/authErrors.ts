/**
 * Supabase 인증(Auth) 에러 메시지를 한글로 변환해주는 유틸리티 함수입니다.
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return "알 수 없는 오류가 발생했습니다.";

  const message = error.message;

  // 1. 로그인 실패
  if (message.includes("Invalid login credentials")) {
    return "이메일 또는 비밀번호가 일치하지 않습니다.";
  }
  
  // 2. 이메일 미인증
  if (message.includes("Email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다.\n메일함을 확인하여 인증을 완료해 주세요.";
  }

  // 3. 회원가입 시 이메일 중복
  if (message.includes("User already registered")) {
    return "이미 가입된 이메일 주소입니다.";
  }

  // 4. 짧은 비밀번호
  if (message.includes("Password should be at least")) {
    return "비밀번호가 너무 짧습니다. 6자리 이상으로 입력해주세요.";
  }

  // 5. 너무 많은 요청
  if (error.status === 429 || message.includes("Too many requests")) {
    return "보안을 위해 요청이 일시적으로 제한되었습니다. 잠시 후 다시 시도해 주세요.";
  }

  // 6. 존재하지 않는 사용자 (이메일 찾기 등)
  if (message.includes("User not found")) {
    return "등록되지 않은 사용자입니다.";
  }

  // 기본 반환값: 예기치 못한 에러일 경우 Supabase의 메시지나 기본 문구 출력
  return message || "인증 중 오류가 발생했습니다. 다시 시도해 주세요.";
}
