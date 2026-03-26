import { User } from "lucide-react";

type ProfileProps = {
  nickname?: string;
  avatar_url?: string;
};

export default function ProfileHeader({ nickname, avatar_url }: ProfileProps) {
  const displayNickname = nickname || "김뚜벅";

  return (
    <section className="flex flex-col items-center pt-8 pb-6 text-center">
      <div className="relative w-[84px] h-[84px] rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden border border-gray-100">
        {avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={avatar_url} alt="프로필 이미지" className="w-full h-full object-cover" />
        ) : (
          <User className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">{displayNickname}</h2>
      <p className="text-[13px] font-medium text-gray-500">대중교통 여행 매니아 🚌</p>
    </section>
  );
}
