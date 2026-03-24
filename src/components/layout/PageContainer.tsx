import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string; // 추가적인 스타일(className)을 전달받을 수 있도록 처리
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  // container mx-auto: 가로 중앙 정렬
  // px-4: 모바일 및 작은 화면을 위한 기본 좌우 여백
  // max-w-7xl: 헤더와 동일하게 최대 넓이를 제한하여 일관성 유지
  return (
    <main className={`container mx-auto px-4 max-w-7xl ${className}`}>
      {children}
    </main>
  );
}
