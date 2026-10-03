"use client";

import { EcoleExtrasPanel } from "./EcoleExtrasPanel";
import type { DashboardCourse } from "@/lib/ecoledirecte/dashboard-types";
import { subjectStyle } from "@/lib/ecoledirecte/subjects";
import { GLASS } from "@/lib/ui/pastel-theme";

export function EdtView() {
  return (
    <EcoleExtrasPanel
      scope="edt"
      title="Emploi du temps"
      subtitle="Tes cours d’aujourd’hui"
    >
      {(data) => {
        const cours = (data.cours as DashboardCourse[]) || [];
        if (cours.length === 0) {
          return (
            <p className={`px-4 py-5 text-sm font-medium text-slate-600 ${GLASS.panel}`}>
              Pas de cours listés pour aujourd’hui — ou EDT indisponible.
            </p>
          );
        }
        return cours.map((c, i) => {
          const style = subjectStyle(c.matiere);
          return (
            <article
              key={`${c.debut}-${c.matiere}-${i}`}
              className={`flex gap-3 overflow-hidden ${GLASS.panel} ${
                c.annule ? "opacity-55" : ""
              }`}
            >
              <span
                className={`w-1.5 shrink-0 bg-gradient-to-b ${style.bar}`}
                aria-hidden
              />
              <span className="min-w-0 flex-1 py-3 pr-3.5">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-black text-slate-900">
                    {c.debut} – {c.fin}
                  </span>
                  {c.annule && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-rose-600">
                      Annulé
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[15px] font-bold text-slate-800">
                  {c.matiere}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-slate-500">
                  {[c.salle, c.prof].filter(Boolean).join(" · ") || "—"}
                </span>
              </span>
            </article>
          );
        });
      }}
    </EcoleExtrasPanel>
  );
}
