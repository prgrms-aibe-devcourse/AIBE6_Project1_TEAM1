"use client";

import { ReactNode } from "react";

interface AIFilterBadgeProps {
  children: ReactNode;
  className?: string;
}

export default function AIFilterBadge({ children, className = "" }: AIFilterBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium 
        bg-gray-100 text-gray-700 rounded-full ${className}`}
    >
      {children}
    </span>
  );
}
