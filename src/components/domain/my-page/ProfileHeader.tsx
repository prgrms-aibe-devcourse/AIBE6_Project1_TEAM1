import { User } from "lucide-react";
import Link from "next/link";

type ProfileProps = {
  nickname?: string;
  avatar_url?: string;
  triplogCount?: number;
};

export default function ProfileHeader({ nickname, avatar_url, triplogCount = 0 }: ProfileProps) {
  const displayNickname = nickname || "뚜벅이";

  const getProfileTitle = (count: number) => {
    if (count >= 20) return "뚜벅이 여행 마스터 🚌";
    if (count >= 15) return "뚜벅이 여행 전문가 🚶";
    if (count >= 10) return "뚜벅이 여행 매니아 🎒";
    if (count >= 5) return "뚜벅이 여행 초보 👟";
    return "뚜벅이 여행 입문 🥾";
  };

  return (
    <Link href="/mypage/settings/edit" className="flex flex-col items-center pt-8 pb-6 text-center group cursor-pointer rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mx-auto w-full max-w-sm">
      <div className="relative w-[84px] h-[84px] rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 overflow-hidden border border-gray-100 dark:border-gray-700">
        {avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={avatar_url} alt="프로필 이미지" className="w-full h-full object-cover" />
        ) : (
          <User className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{displayNickname}</h2>
      <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">{getProfileTitle(triplogCount)}</p>
    </Link>
  );
}
