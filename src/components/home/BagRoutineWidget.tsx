"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Backpack, ChevronRight, GraduationCap } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { PASTEL_GRADIENTS, PASTEL_ICON } from "@/lib/ui/pastel-theme";
import { bagItemsForTomorrow } from "@/lib/bag-for-schedule";
import { formatTomorrowLabel } from "@/lib/tomorrow-schedule";

type BagRoutineWidgetProps = {
  variant?: "card" | "tile";
};

export function BagRoutineWidget({ variant = "card" }: BagRoutineWidgetProps) {
  const { subjects, isWeekend, expandedItems } = useMemo(() => bagItemsForTomorrow(), []);

  if (variant === "tile") {
    return (
      <Link href="/routine/sac" prefetch className="touch-target block h-full min-h-0 w-full">
        <BentoCard
          variant="gradient"
          gradient={PASTEL_GRADIENTS.bag}
          className="relative flex h-full min-h-[10.5rem] flex-col justify-between overflow-hidden p-4 sm:min-h-0 sm:p-5"
        >
          <span
            className="pointer-events-none absolute -bottom-2 -right-1 text-6xl opacity-[0.12] sm:text-7xl"
            aria-hidden
          >
            🎒
          </span>
          <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/35 blur-2xl" />

          <div className="relative z-10">
            <div
              className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${PASTEL_ICON.bag} shadow-md shadow-teal-200/30`}
            >
              <Backpack className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <p className="text-xl font-bold text-slate-800 sm:text-2xl">Sac</p>
            {isWeekend ? (
              <p className="mt-2 text-sm font-medium text-slate-600">Week-end 🌴</p>
            ) : (
              <>
                <p className="mt-1 text-4xl font-bold tabular-nums leading-none text-teal-800 sm:text-5xl">
                  {expandedItems.length}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-teal-900/60">
                  objets · {formatTomorrowLabel()}
                </p>
              </>
            )}
          </div>

          {!isWeekend && (
            <div className="relative z-10 mt-2 flex items-center justify-between gap-1">
              <div className="flex min-w-0 flex-wrap gap-1">
                {subjects.slice(0, 2).map((s) => (
                  <span
                    key={s}
                    className="truncate rounded-md bg-white/60 px-1.5 py-0.5 text-[10px] font-bold text-teal-900 sm:text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-teal-600" strokeWidth={2.5} />
            </div>
          )}
        </BentoCard>
      </Link>
    );
  }

  return (
    <BentoCard
      variant="gradient"
      gradient={PASTEL_GRADIENTS.bag}
      className="relative flex h-full flex-col justify-between overflow-hidden p-4 sm:p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${PASTEL_ICON.bag} shadow-md shadow-teal-200/40`}
          >
            <Backpack className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800/70">
              Emploi du temps
            </p>
            <p className="text-lg font-bold text-slate-800 sm:text-xl">Le Sac</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/50 bg-white/45 p-3 shadow-sm shadow-teal-100/30 backdrop-blur-sm">
          {isWeekend ? (
            <p className="text-base font-semibold text-slate-700">Pas de cours demain 🌴</p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-800/60">
                {formatTomorrowLabel()}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {subjects.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-white/70 px-2 py-0.5 text-xs font-bold text-teal-900 shadow-sm"
                  >
                    {s}
                  </span>
                ))}
                {subjects.length > 4 && (
                  <span className="text-xs font-semibold text-teal-800/60">
                    +{subjects.length - 4}
                  </span>
                )}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <GraduationCap className="h-4 w-4 text-teal-600" />
                {expandedItems.length} objets selon cours de demain
              </p>
            </>
          )}
        </div>
      </div>

      {!isWeekend && (
        <Link
          href="/routine/sac"
          prefetch
          className="touch-target relative z-20 mt-4 flex min-h-[var(--kiosk-touch-min)] items-center justify-between rounded-2xl border border-white/60 bg-white/90 px-4 shadow-sm shadow-teal-200/25 backdrop-blur-sm active:bg-white"
        >
          <span className="text-base font-bold text-slate-800 sm:text-lg">
            Préparer mon sac
          </span>
          <ChevronRight className="h-6 w-6 text-teal-500" strokeWidth={2.5} />
        </Link>
      )}
    </BentoCard>
  );
}
