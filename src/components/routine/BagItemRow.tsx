"use client";

import { Check } from "lucide-react";
import type { PackItem } from "@/lib/bag-packing-engine";

type BagItemRowProps = {
  item: PackItem;
  checked: boolean;
  onToggle: () => void;
};

export function BagItemRow({ item, checked, onToggle }: BagItemRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`touch-target flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:scale-[0.99] sm:px-4 sm:py-3.5 ${
        checked
          ? "bg-emerald-50/90 ring-1 ring-emerald-200/60"
          : "bg-white ring-1 ring-slate-100 hover:bg-slate-50/80"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-8 sm:w-8 ${
          checked
            ? "bg-emerald-500 text-white"
            : "bg-slate-100 text-transparent ring-2 ring-slate-200"
        }`}
      >
        <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-base font-semibold leading-snug text-slate-900 sm:text-lg ${
            checked ? "text-emerald-900/80 line-through decoration-emerald-400/80" : ""
          }`}
        >
          {item.label}
        </span>
        {!checked && item.category !== "permanent-sac" && item.reason ? (
          <span className="mt-0.5 block truncate text-xs font-medium text-slate-400 sm:text-sm">
            {item.reason}
          </span>
        ) : null}
      </span>
    </button>
  );
}
