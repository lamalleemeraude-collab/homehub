"use client";

import Link from "next/link";
import { X } from "lucide-react";

type RoutineShellProps = {
  title: string;
  children: React.ReactNode;
};

export function RoutineShell({ title, children }: RoutineShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col px-1 py-1 sm:px-2 sm:py-2">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Routine
          </p>
          <h1 className="text-xl font-medium text-slate-900 sm:text-2xl">{title}</h1>
        </div>
        <Link
          href="/"
          className="touch-target flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-slate-500 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:bg-white/85 hover:text-slate-800 sm:h-12 sm:w-12"
          aria-label="Retour à l'accueil"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
}
