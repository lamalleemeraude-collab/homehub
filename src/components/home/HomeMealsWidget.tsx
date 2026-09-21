"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, ChefHat } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { loadLastChefMeal } from "@/lib/meals/pantry-storage";
import type { SavedChefMeal } from "@/lib/meals/chef-types";
import { PASTEL_GRADIENTS, PASTEL_ICON } from "@/lib/ui/pastel-theme";

export function HomeMealsWidget() {
  const [lastMeal, setLastMeal] = useState<SavedChefMeal | null>(null);

  useEffect(() => {
    setLastMeal(loadLastChefMeal());
  }, []);

  return (
    <Link href="/repas" prefetch className="touch-target block h-full min-h-0 w-full">
      <BentoCard
        variant="gradient"
        gradient={PASTEL_GRADIENTS.canteen}
        className="relative flex h-full min-h-[10.5rem] flex-col justify-between overflow-hidden p-4 sm:min-h-0 sm:p-5"
      >
        <span className="pointer-events-none absolute -bottom-2 -right-1 text-6xl opacity-[0.1]" aria-hidden>
          👨‍🍳
        </span>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${PASTEL_ICON.canteen} shadow-md`}
            >
              <ChefHat className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/60">
                Chef
              </p>
              <p className="text-xl font-bold text-slate-800">Quoi ce soir ?</p>
            </div>
          </div>

          <p className="mt-3 text-sm font-medium leading-snug text-slate-600">
            Frigo + envie → 3 recettes avec étapes et courses
          </p>

          {lastMeal && (
            <div className="mt-3 rounded-xl border border-white/50 bg-white/55 px-3 py-2 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Dernier choix
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {lastMeal.recipe.emoji} {lastMeal.recipe.title}
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 mt-2 flex items-center justify-end text-sm font-bold text-emerald-700">
          Générer
          <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
        </div>
      </BentoCard>
    </Link>
  );
}
