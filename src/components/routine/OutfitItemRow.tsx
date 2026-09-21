"use client";

import { Check } from "lucide-react";

type OutfitItemRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export function OutfitItemRow({ label, checked, onToggle }: OutfitItemRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`touch-target flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:scale-[0.99] sm:px-4 sm:py-3.5 ${
        checked
          ? "bg-rose-50/90 ring-1 ring-rose-200/60"
          : "bg-white/80 ring-1 ring-white/60 backdrop-blur-sm"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8 ${
          checked
            ? "bg-rose-400 text-white"
            : "bg-white text-transparent ring-2 ring-rose-100"
        }`}
      >
        <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
      </span>
      <span
        className={`min-w-0 flex-1 text-base font-semibold leading-snug text-slate-900 sm:text-lg ${
          checked ? "text-rose-900/75 line-through decoration-rose-300/80" : ""
        }`}
      >
        {label}
      </span>
    </button>
  );
}
