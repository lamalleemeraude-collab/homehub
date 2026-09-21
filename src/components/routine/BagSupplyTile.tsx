"use client";

import { Check } from "lucide-react";
import { BAG_CATEGORY_META, type BagSupplyItem } from "@/lib/bag-supplies";
import type { ShoppingGridLayout } from "@/lib/shopping-grid";

type BagSupplyTileProps = {
  item: BagSupplyItem;
  checked: boolean;
  onToggle: () => void;
  layout?: ShoppingGridLayout;
};

export function BagSupplyTile({
  item,
  checked,
  onToggle,
  layout,
}: BagSupplyTileProps) {
  const meta = BAG_CATEGORY_META[item.category];
  const padding = layout?.paddingClass ?? "p-3";
  const labelClass =
    layout?.labelClass ?? "text-base sm:text-lg";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`touch-target relative z-10 flex h-full min-h-[88px] w-full min-w-0 flex-col items-center justify-center rounded-2xl border-[3px] shadow-md transition-all active:scale-[0.97] sm:min-h-[96px] sm:rounded-3xl ${padding} ${
        checked
          ? "border-emerald-500 bg-emerald-100 shadow-emerald-200/60"
          : `${meta.tile} shadow-slate-200/80`
      }`}
    >
      {checked && (
        <span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md sm:h-8 sm:w-8 sm:rounded-xl">
          <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
        </span>
      )}
      <span
        className={`line-clamp-3 w-full whitespace-pre-line px-1 text-center font-black leading-tight tracking-tight ${labelClass} ${
          checked
            ? "text-emerald-900 line-through decoration-2 opacity-80"
            : meta.text
        }`}
      >
        {item.shortLabel}
      </span>
    </button>
  );
}
