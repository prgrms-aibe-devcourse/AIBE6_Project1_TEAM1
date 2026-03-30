"use client";

import { ChevronLeft, ChevronDown, Mail, MessageCircle, Phone, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    question: "탈퇴는 어떻게 하나요?",
    answer: "마이페이지 > 개인정보 수정 > 계정 삭제 메뉴에서 탈퇴하실 수 있습니다. 탈퇴 후 데이터 복구는 불가능하오니 신중히 결정해주세요.",
  },
  {
    question: "리뷰 수정 및 삭제는 어디서 할 수 있나요?",
    answer: "마이페이지 > 작성한 리뷰 메뉴에서 본인이 작성한 리뷰의 수정 및 삭제가 가능합니다.",
  },
  {
    question: "여행 코스를 비공개로 전환할 수 있나요?",
    answer: "여행 일정 상세 페이지 상단의 공개 여부 설정 버튼을 통해 해당 코스를 본인만 볼 수 있도록 비공개 처리가 가능합니다.",
  },
  {
    question: "내 주변 코스 추천이 정확하지 않아요.",
    answer: "GPS 위치 정보 수신 권한이 허용되어 있는지 확인해주세요. 실내나 지하의 경우 위치 정보 수신이 불안정할 수 있습니다.",
  },
  {
    question: "데이터는 얼마나 자주 동기화 되나요?",
    answer: "여행 중에는 실시간으로 데이터가 저장되며, 모든 정보는 클라우드를 통해 다른 기기에서도 동기화되어 확인하실 수 있습니다.",
  },
];

export default function CustomerSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-4">
          <Link 
            href="/mypage" 
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-purple-600 transition-colors" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">고객센터</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {/* Support Banner */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 mb-10 text-white relative overflow-hidden shadow-xl shadow-purple-100">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">무엇을 도와드릴까요?</h2>
            <p className="text-purple-100 text-[14px]">
              자주 묻는 질문을 확인하거나 직접 문의를 남겨주세요.<br />
              뚜벅 팀이 정성껏 도와드리겠습니다.
            </p>
          </div>
          <div className="absolute right-[-10%] bottom-[-10%] opacity-20 transform rotate-12">
            <MessageCircle className="w-40 h-40" />
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-[14px] font-bold text-gray-900">1:1 채팅 문의</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group">
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Mail className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-[14px] font-bold text-gray-900">이메일 문의</span>
          </button>
        </div>

        {/* FAQ Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <Search className="w-5 h-5 text-purple-600" />
            <h3 className="text-[17px] font-bold text-gray-900">자주 묻는 질문 (FAQ)</h3>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx} 
                className={`border rounded-2xl transition-all duration-200 ${
                  openFaq === idx ? "border-purple-200 bg-purple-50/30" : "border-gray-100 bg-white"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-[15px] font-bold text-gray-800 leading-snug">
                    <span className="text-purple-600 mr-2 uppercase">Q.</span>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180 text-purple-500" : ""
                  }`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === idx ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}>
                  <div className="px-5 pb-5 pt-0 text-[14px] text-gray-500 leading-relaxed border-t border-purple-100/50 mt-1 pt-4">
                    <span className="text-indigo-600 font-bold mr-2 uppercase">A.</span>
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support Info Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center gap-4 text-center">
          <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
            고객센터 운영시간: 평일 10:00 - 18:00 (주말/공휴일 제외)<br />
            점심시간: 12:30 - 13:30
          </p>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[12px] font-bold text-gray-500">전화 문의: 1544-0000</span>
          </div>
        </div>
      </main>
    </div>
  );
}
