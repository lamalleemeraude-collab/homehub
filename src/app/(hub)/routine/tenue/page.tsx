"use client";

import { useState } from "react";
import Link from "next/link";
import { OutfitStep } from "@/components/routine/OutfitStep";
import { RoutineShell } from "@/components/routine/RoutineShell";
import { BentoCard } from "@/components/ui/BentoCard";
import { FILLED_CTA, PASTEL_GRADIENTS } from "@/lib/ui/pastel-theme";

export default function TenueRoutinePage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function checkMany(ids: string[]) {
    setChecked((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
  }

  if (finished) {
    return (
      <div className="kiosk-shell flex flex-col items-center justify-center gap-6 px-6 py-8 sm:gap-8 sm:px-8">
        <span className="text-6xl sm:text-8xl">👕</span>
        <h1 className="text-center text-3xl font-black text-slate-800 sm:text-5xl">
          Tenue prête !
        </h1>
        <p className="text-lg font-medium text-slate-500 sm:text-xl">
          Prête pour demain à Saint-Lunaire
        </p>
        <Link
          href="/"
          className={`touch-target mt-2 flex min-h-[var(--kiosk-touch-min)] items-center justify-center rounded-2xl px-10 text-lg font-bold active:opacity-90 sm:mt-4 sm:px-16 sm:text-xl ${FILLED_CTA.outfit}`}
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <RoutineShell title="Préparer la tenue">
      <BentoCard
        variant="gradient"
        gradient={PASTEL_GRADIENTS.outfit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6"
      >
        <OutfitStep
          checked={checked}
          onToggle={toggle}
          onCheckMany={checkMany}
          onFinish={() => setFinished(true)}
        />
      </BentoCard>
    </RoutineShell>
  );
}
