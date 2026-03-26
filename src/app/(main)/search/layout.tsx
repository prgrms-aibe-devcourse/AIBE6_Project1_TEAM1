import GlobalHeader from "@/components/layout/GlobalHeader";
import PageContainer from "@/components/layout/PageContainer";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GlobalHeader />
      <PageContainer>
        {children}
      </PageContainer>
    </>
  );
}