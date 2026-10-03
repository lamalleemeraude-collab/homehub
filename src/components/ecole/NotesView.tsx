"use client";

import { EcoleExtrasPanel } from "./EcoleExtrasPanel";
import type { DashboardGrade } from "@/lib/ecoledirecte/dashboard-types";
import { subjectStyle } from "@/lib/ecoledirecte/subjects";
import { GLASS } from "@/lib/ui/pastel-theme";

export function NotesView() {
  return (
    <EcoleExtrasPanel
      scope="notes"
      title="Notes"
      subtitle="Tes dernières notes ÉcoleDirecte"
    >
      {(data) => {
        const notes = (data.notes as DashboardGrade[]) || [];
        if (notes.length === 0) {
          return (
            <p
              className={`px-3.5 py-4 text-sm font-medium text-slate-600 ${GLASS.panel}`}
            >
              Aucune note récente pour l’instant.
            </p>
          );
        }
        return notes.map((n, i) => {
          const style = subjectStyle(n.matiere);
          return (
            <article
              key={`${n.matiere}-${n.date}-${i}`}
              className={`flex min-h-14 items-center gap-2.5 px-3 py-2.5 ${GLASS.panel}`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${style.bar} text-white shadow-md`}
              >
                <span className="text-sm font-black leading-none tabular-nums">
                  {n.note}
                </span>
                <span className="text-[0.5625rem] font-semibold opacity-80">
                  /{n.sur}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">
                  {n.matiere}
                </span>
                {n.devoir && (
                  <span className="mt-0.5 block truncate text-[0.75rem] text-slate-500">
                    {n.devoir}
                  </span>
                )}
                {n.date && (
                  <span className="mt-0.5 block text-[0.6875rem] font-medium text-slate-400">
                    {n.date}
                  </span>
                )}
              </span>
            </article>
          );
        });
      }}
    </EcoleExtrasPanel>
  );
}
