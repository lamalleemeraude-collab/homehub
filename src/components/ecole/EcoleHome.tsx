"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  RefreshCw,
  School,
} from "lucide-react";
import { ECOLE_MODULES, moduleTone } from "@/lib/ecole/modules";
import { formatHomeworkDay } from "@/lib/ecoledirecte/subjects";
import type { StudentDashboard } from "@/lib/ecoledirecte/dashboard-types";
import { GLASS } from "@/lib/ui/pastel-theme";

type State =
  | { status: "loading" }
  | { status: "ok"; data: StudentDashboard }
  | { status: "error"; message: string; code?: number }
  | { status: "qcm" };

function firstName(eleve: string) {
  return eleve.trim().split(/\s+/)[0] || "Maelle";
}

export function EcoleHome() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const boot = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ecoledirecte/dashboard", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.qcm || data.code === 250) {
        setState({ status: "qcm" });
        return;
      }
      if (!data.ok) {
        setState({
          status: "error",
          message: data.error || "Impossible de charger l’école",
          code: data.code,
        });
        return;
      }
      setState({ status: "ok", data });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Erreur réseau",
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (boot.current) return;
    boot.current = true;
    void load();
  }, [load]);

  const name =
    state.status === "ok" ? firstName(state.data.eleve) : "Maelle";

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden px-5 py-5 ${GLASS.panel}`}
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-0 h-32 w-32 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600/80">
              <School className="h-3.5 w-3.5" />
              École
            </p>
            <h1 className="mt-1 text-[1.85rem] font-black tracking-tight text-slate-900">
              Salut {name}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Ton espace collège — clair, utile, sans blabla.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              void load();
            }}
            disabled={refreshing}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-sky-700 shadow-sm active:scale-95 disabled:opacity-50"
            aria-label="Actualiser"
          >
            <RefreshCw
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {state.status === "ok" && state.data.mission && (
          <Link
            href="/devoirs"
            className="relative mt-4 block rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-50/90 to-white/70 px-3.5 py-3 active:scale-[0.99]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">
              Mission du moment
              {state.data.mission.interrogation ? " · Éval" : ""}
            </p>
            <p className="mt-1 text-[15px] font-bold leading-snug text-slate-900">
              {state.data.mission.matiere} — {state.data.mission.title}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Pour {formatHomeworkDay(state.data.mission.date)}
            </p>
          </Link>
        )}

        {state.status === "ok" && (
          <div className="relative mt-3 grid grid-cols-3 gap-2">
            {[
              {
                n: state.data.stats.devoirsRestants,
                l: "devoirs",
              },
              { n: state.data.stats.evals, l: "évals" },
              {
                n: state.data.prochainesEvals[0]
                  ? subjectShortDate(state.data.prochainesEvals[0].date)
                  : "—",
                l: "prochaine",
              },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/70 bg-white/55 px-2 py-2.5 text-center"
              >
                <p className="text-lg font-black text-slate-900">{s.n}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.header>

      <AnimatePresence mode="wait">
        {state.status === "loading" && (
          <p className="mt-4 rounded-3xl border border-white/60 bg-white/55 px-4 py-5 text-sm font-medium text-slate-600 backdrop-blur-xl">
            Préparation de ton espace école…
          </p>
        )}

        {state.status === "qcm" && (
          <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50/90 px-4 py-4 text-sm text-amber-950">
            <p className="font-bold">Connexion sécurité requise</p>
            <p className="mt-1 text-amber-900/80">
              Ouvre Devoirs une fois pour répondre au QCM, puis reviens ici.
            </p>
            <Link
              href="/devoirs"
              className="mt-3 inline-flex rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white"
            >
              Aller aux devoirs
            </Link>
          </div>
        )}

        {state.status === "error" && (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/90 px-4 py-4 text-sm text-rose-950">
            <p className="font-bold">Pas de synchro pour l’instant</p>
            <p className="mt-1">{state.message}</p>
            <p className="mt-2 text-rose-800/80">
              Tu peux quand même ouvrir les outils ci-dessous.
            </p>
          </div>
        )}
      </AnimatePresence>

      {state.status === "ok" && state.data.prochainesEvals.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-slate-500">
            À préparer
          </h2>
          <div className="space-y-2">
            {state.data.prochainesEvals.map((e) => (
              <Link
                key={e.id}
                href="/devoirs"
                className={`flex items-center gap-3 px-3.5 py-3 ${GLASS.panel}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-xs font-black text-white">
                  Éval
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {e.matiere}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {formatHomeworkDay(e.date)}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 px-1 text-[13px] font-bold uppercase tracking-wide text-slate-500">
          Tes outils
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {ECOLE_MODULES.filter((m) => m.id !== "astuce").map((mod, i) => {
            const tone = moduleTone(mod.tone);
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
              >
                <Link
                  href={mod.href}
                  className={`block h-full overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${tone.soft} p-3.5 shadow-lg shadow-slate-900/8 ring-1 ${tone.ring} backdrop-blur-xl active:scale-[0.98]`}
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tone.icon} text-white shadow-md`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.4} />
                  </span>
                  {mod.badge && (
                    <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide text-rose-600">
                      {mod.badge}
                    </span>
                  )}
                  <p className="mt-3 text-[15px] font-black text-slate-900">
                    {mod.label}
                  </p>
                  <p className="mt-0.5 text-xs font-medium leading-snug text-slate-500">
                    {mod.blurb}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className={`mt-5 px-4 py-4 ${GLASS.panel}`}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600/80">
          Astuce du jour
        </p>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-800">
          {TIP_OF_DAY()}
        </p>
        <Link
          href="/ecole/focus"
          className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-sky-700"
        >
          Lancer un focus 15 min
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function subjectShortDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function TIP_OF_DAY() {
  const tips = [
    "Lis l’énoncé à voix haute, puis explique-le avec tes mots — comme si tu aidais une copine.",
    "Pour une éval : 3 tours courts (lire → cacher → redire) valent mieux qu’une longue relecture.",
    "Commence par le devoir le plus “pénible” pendant 10 minutes. Ensuite le reste paraît plus léger.",
    "Fais une flashcard dès qu’un mot ou une règle est flou. Demain, tu gagneras du temps.",
    "Après 15 min de travail, 3 min de pause sans écran. Ton cerveau range mieux.",
  ];
  const day = new Date().getDate();
  return tips[day % tips.length];
}
