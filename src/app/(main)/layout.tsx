import PageContainer from "@/components/layout/PageContainer";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <PageContainer>
      {children}
    </PageContainer>
  );
}
