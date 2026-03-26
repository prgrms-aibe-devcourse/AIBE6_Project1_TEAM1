import { User } from "lucide-react";

export default function ProfileHero() {
  return (
    <section className="flex flex-col items-center pt-8 pb-6 text-center">
      <div className="w-[84px] h-[84px] rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <User className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">김뚜벅</h2>
      <p className="text-[13px] font-medium text-gray-500">대중교통 여행 매니아 🚌</p>
    </section>
  );
}
