"use client";

interface AITagButtonProps {
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function AITagButton({
  label,
  emoji,
  selected = false,
  onClick,
  disabled = false,
}: AITagButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer border
        ${selected
          ? "bg-gray-900 text-white border-gray-900 shadow-md"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {emoji && <span className="mr-1">{emoji}</span>}
      {label}
    </button>
  );
}
