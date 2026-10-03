"use client";

import Link from "next/link";
import { ChevronRight, School } from "lucide-react";
import { motion } from "framer-motion";
import { GLASS } from "@/lib/ui/pastel-theme";

/** CTA Hub → espace École (iPhone Maelle / ÉcoleDirecte). */
export function RevisionsCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href="/ecole"
        prefetch
        className={`home-panel group flex items-center gap-4 px-4 py-4 sm:px-5 ${GLASS.panel} transition-transform active:scale-[0.99]`}
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-teal-500 shadow-lg shadow-sky-300/35">
          <School className="h-7 w-7 text-white" strokeWidth={2.4} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-sky-700/80">
            Pour Maelle
          </span>
          <span className="mt-0.5 block truncate text-xl font-black tracking-tight text-slate-900">
            Espace École
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium text-slate-500">
            Devoirs · notes · EDT · focus
          </span>
        </span>
        <ChevronRight
          className="h-6 w-6 shrink-0 text-slate-400 transition-transform group-active:translate-x-0.5 group-active:text-sky-600"
          strokeWidth={2.4}
        />
      </Link>
    </motion.div>
  );
}
