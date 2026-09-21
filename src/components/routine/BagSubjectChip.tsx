"use client";

import type { BagSubjectGroup } from "@/lib/bag-subject-groups";

type BagSubjectChipProps = {
  group: BagSubjectGroup;
  selected: boolean;
  done: number;
  total: number;
  onSelect: () => void;
};

export function BagSubjectChip({
  group,
  selected,
  done,
  total,
  onSelect,
}: BagSubjectChipProps) {
  const complete = total > 0 && done === total;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex shrink-0 flex-col items-start gap-0.5 rounded-2xl px-3 py-2.5 text-left transition-all active:scale-[0.98] sm:px-4 sm:py-3 ${
        selected
          ? "bg-slate-700/90 text-white shadow-md shadow-slate-900/10"
          : complete
            ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/70"
            : "bg-white text-slate-700 ring-1 ring-slate-200/80"
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span className="text-base leading-none sm:text-lg">{group.emoji}</span>
        <span className="max-w-[7rem] truncate text-sm font-bold sm:max-w-[9rem] sm:text-base">
          {group.label}
        </span>
      </span>
      <span
        className={`text-xs font-semibold tabular-nums ${
          selected ? "text-white/70" : complete ? "text-emerald-600" : "text-slate-400"
        }`}
      >
        {group.time ? `${group.time} · ` : ""}
        {done}/{total}
        {complete ? " ✓" : ""}
      </span>
    </button>
  );
}
