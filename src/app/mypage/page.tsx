import LevelProgressBar from "@/components/domain/my-page/LevelProgressBar";
import MenuList from "@/components/domain/my-page/MenuList";
import ProfileHeader from "@/components/domain/my-page/ProfileHeader";
import StatCardGroup from "@/components/domain/my-page/StatCardGroup";
import { createClient } from "@/utils/supabase/server";

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 pb-20">
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-10 flex flex-col">
        <ProfileHeader nickname={profile?.nickname} avatar_url={profile?.avatar_url} />
        <StatCardGroup />
        <div className="mt-8 md:mt-10">
          <MenuList />
          <LevelProgressBar />
        </div>
      </main>
    </div>
  );
}
