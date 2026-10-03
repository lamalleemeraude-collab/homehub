"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";
import { GLASS } from "@/lib/ui/pastel-theme";

const PRESETS = [
  { label: "10 min", seconds: 10 * 60 },
  { label: "15 min", seconds: 15 * 60 },
  { label: "25 min", seconds: 25 * 60 },
] as const;

const STEPS = [
  "Lis le devoir ou la leçon une fois sans noter.",
  "Ferme le cahier. Dis à voix haute ce que tu as compris.",
  "Note 3 mots-clés ou une flashcard.",
  "Refais un dernier tour rapide — puis pause.",
];

function format(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FocusTimer() {
  const [total, setTotal] = useState(15 * 60);
  const [left, setLeft] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (tick.current) clearInterval(tick.current);
      return;
    }
    tick.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          setRunning(false);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]);

  useEffect(() => {
    if (!running || left === 0) return;
    const progress = 1 - left / total;
    const idx = Math.min(
      STEPS.length - 1,
      Math.floor(progress * STEPS.length)
    );
    setStep(idx);
  }, [left, running, total]);

  const ratio = total > 0 ? left / total : 0;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className={`px-4 py-4 ${GLASS.panel}`}>
        <Link
          href="/ecole"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          École
        </Link>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
          Focus
        </h1>
        <p className="mt-0.5 text-sm font-medium text-slate-500">
          Un créneau court, une méthode claire.
        </p>
      </header>

      <div className="mt-3 flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              setRunning(false);
              setTotal(p.seconds);
              setLeft(p.seconds);
              setStep(0);
            }}
            className={`flex-1 rounded-2xl border px-2 py-2.5 text-sm font-bold transition ${
              total === p.seconds
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-white/60 bg-white/50 text-slate-600"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <motion.div
        className={`relative mt-4 flex flex-col items-center px-4 py-8 ${GLASS.panel}`}
        animate={{ scale: running ? 1 : 0.99 }}
      >
        <div className="relative flex h-44 w-44 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(148,163,184,0.25)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#focusGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - ratio)}`}
              className="transition-[stroke-dashoffset] duration-1000 linear"
            />
            <defs>
              <linearGradient id="focusGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          <p className="text-4xl font-black tabular-nums text-slate-900">
            {format(left)}
          </p>
        </div>

        <p className="mt-2 text-center text-sm font-semibold text-slate-700">
          {left === 0
            ? "Terminé — pause 3 min, sans écran."
            : STEPS[step]}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setLeft(total);
              setStep(0);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-600"
            aria-label="Réinitialiser"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            disabled={left === 0}
            className="flex h-14 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 text-base font-black text-white shadow-lg shadow-amber-300/40 active:scale-95 disabled:opacity-40"
          >
            {running ? (
              <>
                <Pause className="h-5 w-5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" /> {left === total ? "Go" : "Reprendre"}
              </>
            )}
          </button>
        </div>
      </motion.div>

      <Link
        href="/devoirs"
        className={`mt-3 block px-4 py-3.5 text-center text-sm font-bold text-sky-800 ${GLASS.panel}`}
      >
        Ouvrir les devoirs pendant le focus
      </Link>
    </div>
  );
}
