"use client";

import { EcoleExtrasPanel } from "./EcoleExtrasPanel";
import type { DashboardAbsence } from "@/lib/ecoledirecte/dashboard-types";
import { GLASS } from "@/lib/ui/pastel-theme";

export function VieScolaireView() {
  return (
    <EcoleExtrasPanel
      scope="vie"
      title="Vie scolaire"
      subtitle="Absences & retards récents"
    >
      {(data) => {
        const absences = (data.absences as DashboardAbsence[]) || [];
        if (absences.length === 0) {
          return (
            <div className={`px-4 py-5 ${GLASS.panel}`}>
              <p className="text-sm font-bold text-emerald-700">
                Rien à signaler
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Pas d’absence ou retard récent — bravo.
              </p>
            </div>
          );
        }
        return absences.map((a, i) => (
          <article
            key={`${a.date}-${a.type}-${i}`}
            className={`px-3.5 py-3 ${GLASS.panel}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">{a.type}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  a.justifie
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {a.justifie ? "Justifié" : "À justifier"}
              </span>
            </div>
            {a.libelle && (
              <p className="mt-1 text-sm font-medium text-slate-600">
                {a.libelle}
              </p>
            )}
            {a.date && (
              <p className="mt-1 text-xs font-medium text-slate-400">{a.date}</p>
            )}
          </article>
        ));
      }}
    </EcoleExtrasPanel>
  );
}
