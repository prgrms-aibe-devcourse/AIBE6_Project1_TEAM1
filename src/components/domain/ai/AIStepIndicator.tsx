"use client";

import { Check } from "lucide-react";

interface AIStepIndicatorProps {
  currentStep: number;
  steps: { num: number; label: string }[];
}

export default function AIStepIndicator({ currentStep, steps }: AIStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 pt-6">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep > s.num
                  ? "bg-gray-900 text-white"
                  : currentStep === s.num
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-400"
              }`}
            >
              {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-xs ${
                currentStep >= s.num ? "text-gray-900 font-medium" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 h-[2px] mx-2 mb-5 ${
                currentStep > s.num ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
