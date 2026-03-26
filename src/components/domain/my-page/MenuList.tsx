import { MapPin, MessageSquare, Bell, Settings, Megaphone, Headphones, ChevronRight } from "lucide-react";

export default function MenuList() {
  const menus = [
    { icon: <MapPin className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />, label: "내 여행 기록" },
    { icon: <MessageSquare className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />, label: "작성한 리뷰" },
    { icon: <Bell className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />, label: "알림 설정" },
    { icon: <Settings className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />, label: "앱 설정" },
    { icon: <Megaphone className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />, label: "공지사항" },
    { icon: <Headphones className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.5} />, label: "고객센터" },
  ];

  return (
    <section className="flex flex-col pt-4 mx-auto w-full max-w-2xl px-2 md:px-0">
      {menus.map((menu, idx) => (
        <button 
          key={idx} 
          className="flex items-center justify-between w-full px-4 py-[18px] hover:bg-gray-50 transition-colors group rounded-xl"
        >
          <div className="flex items-center gap-4">
            {menu.icon}
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900">{menu.label}</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] text-gray-300" strokeWidth={2} />
        </button>
      ))}
    </section>
  );
}
