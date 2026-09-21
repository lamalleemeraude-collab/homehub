"use client";

import Link from "next/link";
import { ShoppingCart, UtensilsCrossed } from "lucide-react";
import { MealIdeasWidget } from "@/components/meals/MealIdeasWidget";

/**
 * Repas kiosk — une seule mission : proposer 3 idées.
 */
export function MealsView() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <header className="flex shrink-0 items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-md shadow-teal-200/50 sm:h-14 sm:w-14">
            <UtensilsCrossed className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              Repas
            </h1>
            <p className="mt-0.5 text-base font-medium text-slate-500">
              Ce soir, on mange quoi ? 🍽️
            </p>
          </div>
        </div>
        <Link
          href="/shopping"
          prefetch
          className="touch-target inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-xl active:scale-[0.98]"
        >
          <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
          Courses
        </Link>
      </header>

      <MealIdeasWidget />
    </div>
  );
}
