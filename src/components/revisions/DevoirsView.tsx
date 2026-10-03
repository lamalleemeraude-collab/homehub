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
    !open && item.contenu.length > 110
      ? `${item.contenu.slice(0, 110).trim()}…`
      : item.contenu;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.35 }}
      className={`overflow-hidden ${GLASS.panel}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-stretch gap-0 text-left"
      >
        <span
          className={`w-1.5 shrink-0 bg-gradient-to-b ${style.bar}`}
          aria-hidden
        />
        <span
          className={`min-w-0 flex-1 bg-gradient-to-br ${style.soft} px-3.5 py-3.5`}
        >
          <span className="flex items-start justify-between gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${style.chip}`}
            >
              {style.short}
            </span>
            <span className="flex items-center gap-1.5">
              {item.interrogation && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm shadow-rose-300/50">
                  <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
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
            className={`mt-2 whitespace-pre-wrap text-[15px] font-semibold leading-snug text-slate-900 ${
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
                className="mt-3 text-xs font-medium text-slate-400"
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
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden px-5 py-5 ${GLASS.panel}`}
      >
        <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-sky-300/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-indigo-300/20 blur-2xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <Link
              href="/ecole"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              École
            </Link>
            <h1 className="mt-1 text-[1.75rem] font-black tracking-tight text-slate-900">
              Devoirs · {name}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-sky-700 shadow-sm active:scale-95 disabled:opacity-50"
            aria-label="Actualiser"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              strokeWidth={2.4}
            />
          </button>
        </div>

        {evals.length > 0 && (
          <div className="relative mt-4 flex items-center gap-2 rounded-2xl border border-rose-200/70 bg-rose-50/90 px-3 py-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-rose-500" />
            <p className="text-xs font-semibold text-rose-900">
              Prochaine éval :{" "}
              {subjectStyle(evals[0].matiere).short}
              {" · "}
              {formatHomeworkDay(evals[0].date).split("·")[0].trim()}
            </p>
          </div>
        )}
      </motion.header>

      <div className="mt-5 space-y-6">
        {groups.map(([date, items]) => (
          <section key={date}>
            <h2 className="sticky top-0 z-10 mb-2.5 bg-gradient-to-b from-[#e8eef8]/95 via-[#e8eef8]/85 to-transparent px-1 pb-2 pt-1 text-[13px] font-bold capitalize tracking-wide text-slate-600 backdrop-blur-sm">
              {formatHomeworkDay(date)}
            </h2>
            <div className="space-y-2.5">
              {items.map((item) => {
                const i = cardIndex++;
                return <DevoirCard key={item.id} item={item} index={i} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
