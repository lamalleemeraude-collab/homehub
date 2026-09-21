"use client";

import { Check } from "lucide-react";

type ChecklistItemProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export function ChecklistItem({ label, checked, onToggle }: ChecklistItemProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`touch-target flex w-full min-h-[72px] items-center gap-5 rounded-3xl border px-6 transition-all duration-300 ease-out ${
        checked
          ? "border-emerald-300/70 bg-emerald-50/80 shadow-md shadow-emerald-200/30"
          : "border-white/70 bg-white/55 shadow-md shadow-slate-900/5 backdrop-blur-xl hover:border-white/90 hover:bg-white/75"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          checked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-200 bg-white"
        }`}
      >
        {checked && <Check className="h-6 w-6" strokeWidth={3} />}
      </span>
      <span
        className={`text-left text-2xl font-medium ${
          checked ? "text-emerald-800/80 line-through" : "text-slate-900"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
