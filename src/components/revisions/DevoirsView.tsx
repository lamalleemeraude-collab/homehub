"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { HomeworkItem, HomeworkResponse } from "@/lib/ecoledirecte/types";
import {
  formatHomeworkDay,
  subjectStyle,
} from "@/lib/ecoledirecte/subjects";
import { GLASS } from "@/lib/ui/pastel-theme";
import { MobileScreen } from "@/components/mobile/MobileScreen";

function firstName(eleve: string): string {
  return eleve.trim().split(/\s+/)[0] || "Maelle";
}

function DevoirCard({
  item,
  index,
}: {
  item: HomeworkItem;
  index: number;
}) {
  const [open, setOpen] = useState(item.interrogation || index < 2);
  const style = subjectStyle(item.matiere);
  const collapsed =
    !open && item.contenu.length > 90
      ? `${item.contenu.slice(0, 90).trim()}…`
      : item.contenu;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2), duration: 0.3 }}
      className={`overflow-hidden ${GLASS.panel}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="app-card-tap flex min-h-12 w-full items-stretch gap-0 text-left"
      >
        <span
          className={`w-1.5 shrink-0 bg-gradient-to-b ${style.bar}`}
          aria-hidden
        />
        <span
          className={`min-w-0 flex-1 bg-gradient-to-br ${style.soft} px-3 py-3`}
        >
          <span className="flex items-start justify-between gap-2">
            <span
              className={`inline-flex max-w-[55%] truncate rounded-full px-2 py-0.5 text-[0.6875rem] font-bold tracking-wide ${style.chip}`}
            >
              {style.short}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {item.interrogation && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-white">
                  <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} />
                  Éval
                </span>
              )}
              {item.fait ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                />
              )}
            </span>
          </span>

          <p
            className={`mt-1.5 whitespace-pre-wrap text-[0.9375rem] font-semibold leading-snug text-slate-900 ${
              item.fait ? "line-through opacity-55" : ""
            }`}
          >
            {collapsed}
          </p>

          <AnimatePresence initial={false}>
            {open && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-[0.75rem] font-medium text-slate-400"
              >
                {item.prof ? `${item.prof}` : "Prof"}
                {item.donneLe ? ` · donné le ${item.donneLe}` : ""}
              </motion.p>
            )}
          </AnimatePresence>
        </span>
      </button>
    </motion.article>
  );
}

export function DevoirsView({
  data,
  onRefresh,
  refreshing,
}: {
  data: HomeworkResponse;
  onRefresh: () => void;
  refreshing?: boolean;
}) {
  const name = firstName(data.eleve);
  const todo = data.devoirs.filter((d) => !d.fait);
  const evals = todo.filter((d) => d.interrogation);

  const groups = useMemo(() => {
    const map = new Map<string, HomeworkItem[]>();
    for (const item of data.devoirs) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [data.devoirs]);

  let cardIndex = 0;

  return (
    <MobileScreen>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden px-3.5 py-3.5 ${GLASS.panel}`}
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-sky-300/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-indigo-300/20 blur-2xl" />

        <div className="relative flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <Link
              href="/ecole"
              className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-sky-600/85"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              École
            </Link>
            <h1 className="app-title mt-0.5 text-slate-900">
              Devoirs · {name}
            </h1>
            <p className="app-sub mt-0.5">
              {todo.length === 0
                ? "Rien à faire — bien joué !"
                : `${todo.length} devoir${todo.length > 1 ? "s" : ""} à faire`}
              {evals.length > 0
                ? ` · ${evals.length} éval${evals.length > 1 ? "s" : ""}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="app-icon-btn rounded-2xl border border-white/70 bg-white/75 text-sky-700 shadow-sm active:scale-95 disabled:opacity-50"
            aria-label="Actualiser"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={2.4}
            />
          </button>
        </div>

        {evals.length > 0 && (
          <div className="relative mt-2.5 flex items-center gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/90 px-2.5 py-2">
            <Sparkles className="h-4 w-4 shrink-0 text-rose-500" />
            <p className="min-w-0 text-[0.75rem] font-semibold leading-snug text-rose-900">
              Prochaine éval : {subjectStyle(evals[0].matiere).short}
              {" · "}
              {formatHomeworkDay(evals[0].date).split("·")[0].trim()}
            </p>
          </div>
        )}
      </motion.header>

      <div className="mt-3.5 space-y-4">
        {groups.map(([date, items]) => (
          <section key={date}>
            <h2 className="app-section-label sticky top-0 z-10 mb-1.5 bg-gradient-to-b from-[#e8eef8] via-[#e8eef8]/92 to-transparent px-0.5 pb-1.5 pt-0.5 backdrop-blur-[2px]">
              {formatHomeworkDay(date)}
            </h2>
            <div className="space-y-2">
              {items.map((item) => {
                const i = cardIndex++;
                return <DevoirCard key={item.id} item={item} index={i} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </MobileScreen>
  );
}
