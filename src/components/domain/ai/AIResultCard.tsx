"use client";

import { Footprints } from "lucide-react";

interface AIResultCardProps {
  order: number;
  name: string;
  category: string;
  desc: string;
  duration: string;
  walkInfo?: string | null;
}

export default function AIResultCard({
  order,
  name,
  category,
  desc,
  duration,
  walkInfo,
}: AIResultCardProps) {
  return (
    <div>
      {walkInfo && (
        <div className="flex items-center gap-2 py-2 px-2">
          <Footprints className="w-3 h-3 text-gray-300" />
          <span className="text-xs text-gray-400">{walkInfo}</span>
        </div>
      )}
      <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-sm transition">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 shrink-0">
            80×80
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">
                {order}. {name}
              </span>
              <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {category}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            <p className="text-xs text-gray-400 mt-1">머무는 시간: {duration}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
