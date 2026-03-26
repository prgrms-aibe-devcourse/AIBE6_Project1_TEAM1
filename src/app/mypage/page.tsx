import GlobalHeader from "@/components/layout/GlobalHeader";
import ProfileHero from "./components/ProfileHero";
import StatsCard from "./components/StatsCard";
import MenuList from "./components/MenuList";
import LevelCard from "./components/LevelCard";

export default function MyPage() {
  return (
    <div className="min-h-screen bg-white md:bg-gray-50 pb-20">
      <GlobalHeader />
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-10 flex flex-col">
        <ProfileHero />
        <StatsCard />
        <div className="mt-8 md:mt-10">
          <MenuList />
          <LevelCard />
        </div>
        <div className="mt-12 flex justify-center pb-8">
          <button className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors border-b border-transparent hover:border-gray-600 pb-0.5">
            로그아웃
          </button>
        </div>
      </main>
    </div>
  );
}
