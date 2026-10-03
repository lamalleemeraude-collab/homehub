"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, RefreshCw, School } from "lucide-react";
import { ECOLE_MODULES, moduleTone } from "@/lib/ecole/modules";
import { formatHomeworkDay } from "@/lib/ecoledirecte/subjects";
import type { StudentDashboard } from "@/lib/ecoledirecte/dashboard-types";
import { GLASS } from "@/lib/ui/pastel-theme";
import { MobileScreen } from "@/components/mobile/MobileScreen";

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
    <MobileScreen>
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden px-3.5 py-3.5 sm:px-4 sm:py-4 ${GLASS.panel}`}
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-0 h-28 w-28 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-sky-600/85">
              <School className="h-3.5 w-3.5 shrink-0" />
              École
            </p>
            <h1 className="app-title mt-0.5 text-slate-900">Salut {name}</h1>
            <p className="app-sub mt-0.5">
              Ton collège — clair, utile, sans blabla.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              void load();
            }}
            disabled={refreshing}
            className="app-icon-btn rounded-2xl border border-white/70 bg-white/75 text-sky-700 shadow-sm active:scale-95 disabled:opacity-50"
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
            className="app-card-tap relative mt-3 block rounded-2xl border border-sky-200/70 bg-gradient-to-r from-sky-50/95 to-white/75 px-3 py-2.5"
          >
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-sky-600">
              Mission
              {state.data.mission.interrogation ? " · Éval" : ""}
            </p>
            <p className="app-line-clamp-2 mt-1 text-[0.9375rem] font-bold leading-snug text-slate-900">
              {state.data.mission.matiere} — {state.data.mission.title}
            </p>
            <p className="mt-1 text-[0.75rem] font-medium text-slate-500">
              Pour {formatHomeworkDay(state.data.mission.date)}
            </p>
          </Link>
        )}

        {state.status === "ok" && (
          <div className="relative mt-2.5 grid grid-cols-3 gap-1.5">
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
                className="rounded-2xl border border-white/70 bg-white/60 px-1.5 py-2 text-center"
              >
                <p className="truncate text-base font-black tabular-nums text-slate-900 sm:text-lg">
                  {s.n}
                </p>
                <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-slate-400">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.header>

      <AnimatePresence mode="wait">
        {state.status === "loading" && (
          <p className="mt-3 rounded-3xl border border-white/60 bg-white/55 px-3.5 py-4 text-sm font-medium text-slate-600 backdrop-blur-xl">
            Préparation de ton espace école…
          </p>
        )}

        {state.status === "qcm" && (
          <div className="mt-3 rounded-3xl border border-amber-200 bg-amber-50/95 px-3.5 py-3.5 text-sm text-amber-950">
            <p className="font-bold">Connexion sécurité requise</p>
            <p className="mt-1 text-[0.8125rem] leading-snug text-amber-900/80">
              Ouvre Devoirs une fois pour le QCM, puis reviens ici.
            </p>
            <Link
              href="/devoirs"
              className="app-btn mt-3 inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 text-sm font-bold text-white"
            >
              Aller aux devoirs
            </Link>
          </div>
        )}

        {state.status === "error" && (
          <div className="mt-3 rounded-3xl border border-rose-200 bg-rose-50/95 px-3.5 py-3.5 text-sm text-rose-950">
            <p className="font-bold">Pas de synchro pour l’instant</p>
            <p className="mt-1 break-words text-[0.8125rem]">{state.message}</p>
            <p className="mt-2 text-[0.8125rem] text-rose-800/80">
              Tu peux quand même ouvrir les outils ci-dessous.
            </p>
          </div>
        )}
      </AnimatePresence>

      {state.status === "ok" && state.data.prochainesEvals.length > 0 && (
        <section className="mt-4">
          <h2 className="app-section-label mb-1.5 px-0.5">À préparer</h2>
          <div className="space-y-1.5">
            {state.data.prochainesEvals.map((e) => (
              <Link
                key={e.id}
                href="/devoirs"
                className={`app-card-tap flex min-h-12 items-center gap-2.5 px-3 py-2.5 ${GLASS.panel}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-[0.65rem] font-black text-white">
                  Éval
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {e.matiere}
                  </span>
                  <span className="block truncate text-[0.75rem] text-slate-500">
                    {formatHomeworkDay(e.date)}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-4">
        <h2 className="app-section-label mb-1.5 px-0.5">Tes outils</h2>
        <div className="grid grid-cols-2 gap-2">
          {ECOLE_MODULES.filter((m) => m.id !== "astuce").map((mod, i) => {
            const tone = moduleTone(mod.tone);
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
              >
                <Link
                  href={mod.href}
                  className={`app-card-tap block h-full min-h-[6.75rem] overflow-hidden rounded-[1.35rem] border border-white/60 bg-gradient-to-br ${tone.soft} p-3 shadow-lg shadow-slate-900/8 ring-1 ${tone.ring} backdrop-blur-xl`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${tone.icon} text-white shadow-md`}
                    >
                      <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.4} />
                    </span>
                    {mod.badge && (
                      <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-rose-600">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2.5 text-[0.9375rem] font-black leading-tight text-slate-900">
                    {mod.label}
                  </p>
                  <p className="app-line-clamp-2 mt-0.5 text-[0.6875rem] font-medium leading-snug text-slate-500">
                    {mod.blurb}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className={`mt-3.5 px-3.5 py-3.5 ${GLASS.panel}`}>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-indigo-600/80">
          Astuce du jour
        </p>
        <p className="mt-1.5 text-[0.875rem] font-semibold leading-relaxed text-slate-800">
          {TIP_OF_DAY()}
        </p>
        <Link
          href="/ecole/focus"
          className="app-btn mt-2.5 inline-flex items-center gap-1 text-sm font-bold text-sky-700"
        >
          Lancer un focus 15 min
          <ChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </MobileScreen>
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
