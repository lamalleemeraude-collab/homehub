"use client";

import { useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { TouchButton } from "@/components/ui/TouchButton";
import { FILLED_CTA } from "@/lib/ui/pastel-theme";
import { resolveProductInput } from "@/lib/shopping-product-icon";

type AddProductOverlayProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export function AddProductOverlay({
  value,
  onChange,
  onSubmit,
  onClose,
}: AddProductOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resolved = useMemo(() => resolveProductInput(value), [value]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-gradient-to-b from-orange-50/95 to-white backdrop-blur-sm">
      <div className="flex shrink-0 justify-end p-4">
        <TouchButton
          ariaLabel="Annuler"
          onClick={onClose}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-sm active:bg-white"
        >
          <X className="h-7 w-7 text-slate-500" strokeWidth={2.5} />
        </TouchButton>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8">
          <div
            className="shopping-emoji-preview mb-4 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/70 bg-white/80 text-6xl shadow-lg sm:h-28 sm:w-28 sm:text-7xl"
            aria-hidden
          >
            {resolved.emoji}
          </div>

          {resolved.corrected && value.trim() && (
            <p className="mb-3 text-center text-sm font-semibold text-emerald-700">
              Orthographe corrigée :{" "}
              <span className="font-bold">{resolved.label}</span>
            </p>
          )}

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nom du produit…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            className="shopping-input w-full border-0 bg-transparent text-center text-4xl font-black text-slate-900 outline-none placeholder:text-slate-300 sm:text-5xl md:text-6xl"
          />
        </div>

        <div className="shrink-0 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="submit"
            disabled={!value.trim()}
            className={`touch-target flex min-h-[72px] w-full items-center justify-center gap-3 rounded-3xl text-2xl font-bold disabled:opacity-40 sm:min-h-[80px] sm:text-3xl ${FILLED_CTA.shopping}`}
          >
            <span className="text-3xl" aria-hidden>
              {resolved.emoji}
            </span>
            AJOUTER
          </button>
        </div>
      </form>
    </div>
  );
}
