"use client";

import { Check, X } from "lucide-react";
import { TouchButton } from "@/components/ui/TouchButton";
import { CATEGORY_META, type ShoppingItem } from "@/lib/shopping-categories";
import type { ShoppingGridLayout } from "@/lib/shopping-grid";

type ShoppingItemTileProps = {
  item: ShoppingItem;
  layout: ShoppingGridLayout;
  onToggle: () => void;
  onDelete: () => void;
};

export function ShoppingItemTile({
  item,
  layout,
  onToggle,
  onDelete,
}: ShoppingItemTileProps) {
  const meta = CATEGORY_META[item.category];

  return (
    <div className="relative min-h-0 min-w-0">
      <button
        type="button"
        onClick={onToggle}
        className={`touch-target flex h-full min-h-0 w-full flex-col items-center justify-center rounded-3xl border shadow-md transition-all duration-300 ease-out active:scale-[0.98] ${layout.paddingClass} ${
          item.checked
            ? "border-emerald-300/70 bg-emerald-50/85"
            : "border-white/70 bg-white/60 shadow-slate-900/5 backdrop-blur-xl hover:border-white/90 hover:bg-white/80"
        }`}
      >
        <span className={`leading-none ${layout.emojiClass}`} aria-hidden>
          {item.emoji}
        </span>

        <span
          className={`mt-0.5 line-clamp-1 w-full px-1 text-center text-[10px] font-medium leading-none tracking-wide text-slate-400 sm:text-xs ${
            item.checked ? "opacity-60" : ""
          }`}
        >
          {meta.familyLabel}
        </span>

        <span
          className={`mt-1 line-clamp-3 w-full px-1 text-center font-medium leading-tight ${layout.labelClass} ${
            item.checked
              ? "text-emerald-800/75 line-through decoration-2"
              : "text-slate-900"
          }`}
        >
          {item.label}
        </span>

        {item.checked && (
          <span className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-white shadow-sm sm:h-7 sm:w-7">
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
          </span>
        )}
      </button>

      <TouchButton
        ariaLabel={`Supprimer ${item.label}`}
        onClick={onDelete}
        className="absolute -right-1 -top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-rose-400 text-white shadow-md active:bg-rose-500 sm:h-9 sm:w-9"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
      </TouchButton>
    </div>
  );
}
