"use client";

import Link from "next/link";
import { Backpack, ChevronRight, Shirt } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { PASTEL_GRADIENTS, PASTEL_ICON } from "@/lib/ui/pastel-theme";

export default function RoutineHubPage() {
  const routines = [
    {
      href: "/routine/sac",
      title: "Le Sac",
      subtitle: "Selon l'emploi du temps de demain",
      icon: Backpack,
      gradient: PASTEL_GRADIENTS.bag,
      iconGradient: PASTEL_ICON.bag,
      accent: "text-teal-600",
      eyebrow: "Emploi du temps",
    },
    {
      href: "/routine/tenue",
      title: "La Tenue",
      subtitle: "Météo à Saint-Lunaire demain",
      icon: Shirt,
      gradient: PASTEL_GRADIENTS.outfit,
      iconGradient: PASTEL_ICON.outfit,
      accent: "text-rose-500",
      eyebrow: "Routine du soir",
    },
  ] as const;

  return (
    <div className="kiosk-shell flex flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Avant le coucher
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-800 sm:text-4xl">
          Routine du soir
        </h1>
        <p className="mt-2 text-base font-medium text-slate-500 sm:text-lg">
          Deux préparations séparées, simples et rapides
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        {routines.map((routine) => {
          const Icon = routine.icon;
          return (
            <Link
              key={routine.href}
              href={routine.href}
              prefetch
              className="touch-target block min-h-[200px]"
            >
              <BentoCard
                variant="gradient"
                gradient={routine.gradient}
                className="flex h-full flex-col justify-between p-5 sm:p-6"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${routine.iconGradient} shadow-md shadow-slate-200/30`}
                    >
                      <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500/80">
                        {routine.eyebrow}
                      </p>
                      <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                        {routine.title}
                      </h2>
                    </div>
                  </div>
                  <p className="mt-4 text-base font-medium text-slate-600 sm:text-lg">
                    {routine.subtitle}
                  </p>
                </div>
                <div
                  className={`relative z-10 mt-6 flex items-center justify-end gap-2 text-base font-bold text-slate-700 sm:text-lg`}
                >
                  Préparer
                  <ChevronRight className={`h-6 w-6 ${routine.accent}`} strokeWidth={2.5} />
                </div>
              </BentoCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
