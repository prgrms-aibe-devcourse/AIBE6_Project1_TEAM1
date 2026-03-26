import { MapPin, MessageSquare, Bell, Settings, Megaphone, Headphones, ChevronRight } from "lucide-react";

export default function MenuList() {
  const menus = [
    { Icon: MapPin, label: "내 여행 기록" },
    { Icon: MessageSquare, label: "작성한 리뷰" },
    { Icon: Bell, label: "알림 설정" },
    { Icon: Settings, label: "앱 설정" },
    { Icon: Megaphone, label: "공지사항" },
    { Icon: Headphones, label: "고객센터" },
  ];

  return (
    <section className="flex flex-col pt-4 mx-auto w-full max-w-2xl px-2 md:px-0">
      {menus.map(({ Icon, label }, idx) => (
        <button 
          key={idx} 
          className="flex items-center justify-between w-full px-4 py-[18px] hover:bg-gray-50 transition-colors group rounded-xl"
        >
          <div className="flex items-center gap-4">
            <Icon className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] text-gray-300" strokeWidth={2} />
        </button>
      ))}
    </section>
  );
}
