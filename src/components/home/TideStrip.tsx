"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowDownRight, ArrowUpRight, Waves } from "lucide-react";
import { useSaintMaloTides } from "@/hooks/useSaintMaloTides";
import {
  currentTideCoefficient,
  currentTidePhase,
  formatTideHeight,
  formatTideTime,
  getCurrentTideHeight,
  getTideWaterLevel,
  getUpcomingTides,
} from "@/lib/tides/engine";

type Props = {
  ink: string;
  soft: string;
  muted: string;
  accent: string;
};

/** Bandeau marée moderne — horaires Saint-Malo live. */
export function TideStrip({ ink, soft, muted, accent }: Props) {
  const { schedule, port, source, loading } = useSaintMaloTides();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const phase = useMemo(
    () => (now ? currentTidePhase(schedule, now) : "rising"),
    [now, schedule]
  );
  const height = useMemo(
    () => (now ? getCurrentTideHeight(schedule, now) : 0),
    [now, schedule]
  );
  const level = useMemo(
    () => (now ? getTideWaterLevel(schedule, now) : 0.4),
    [now, schedule]
  );
  const coef = useMemo(
    () => (now ? currentTideCoefficient(schedule, now) : undefined),
    [now, schedule]
  );
  const upcoming = useMemo(
    () => (now ? getUpcomingTides(schedule, now, 3) : []),
    [now, schedule]
  );
  const next = upcoming[0];
  const fill = Math.round(level * 100);
  const rising = phase === "rising";

  return (
    <div className="tide-strip min-w-[12.5rem] max-w-sm flex-1">
      <div className="flex items-center justify-between gap-2">
        <p
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${accent}`}
        >
          <Waves className="h-3.5 w-3.5" strokeWidth={2.4} />
          Marée · {port}
        </p>
        {coef != null && (
          <span className="tide-strip__coef rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums text-teal-800">
            coeff. {coef}
          </span>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <span className={`text-2xl font-black tabular-nums tracking-tight sm:text-3xl ${ink}`}>
          {now && !loading ? formatTideHeight(height) : "…"}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-sm font-bold ${
            rising ? "text-teal-600" : "text-sky-600"
          }`}
        >
          {rising ? (
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
          ) : (
            <ArrowDownRight className="h-4 w-4" strokeWidth={2.6} />
          )}
          {rising ? "Montante" : "Descendante"}
        </span>
      </div>

      {next && (
        <p className={`mt-0.5 text-sm font-semibold ${muted}`}>
          Prochaine {next.type === "high" ? "pleine mer" : "basse mer"}{" "}
          <span className={`font-black tabular-nums ${ink}`}>
            {formatTideTime(next.time)}
          </span>
          <span className={`ml-1 font-medium ${soft}`}>
            · {formatTideHeight(next.heightM)}
          </span>
        </p>
      )}

      {/* Gauge moderne : baie + vague */}
      <div
        className="tide-strip__bay relative mt-2.5 h-11 overflow-hidden rounded-2xl"
        role="img"
        aria-label={`Niveau d’eau estimé ${fill} pour cent`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 via-sky-100/40 to-teal-100/50" />
        <div
          className="tide-strip__fill absolute inset-y-0 left-0"
          style={{ width: `${Math.max(12, Math.min(100, fill))}%` }}
        >
          <span className="tide-strip__foam" aria-hidden />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-between px-2.5 pb-1 pt-4">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500/90">
            BM
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500/90">
            PM
          </span>
        </div>
      </div>

      {upcoming.length > 1 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
          {upcoming.slice(0, 3).map((e) => (
            <span
              key={e.time.toISOString()}
              className={`shrink-0 rounded-xl border border-white/60 bg-white/55 px-2 py-1 text-[11px] font-semibold backdrop-blur-sm ${muted}`}
            >
              <span className={e.type === "high" ? "text-teal-700" : "text-sky-700"}>
                {e.type === "high" ? "PM" : "BM"}
              </span>{" "}
              <span className={`tabular-nums ${ink}`}>
                {formatTideTime(e.time)}
              </span>
            </span>
          ))}
        </div>
      )}

      <p className={`mt-1.5 text-[10px] font-medium ${muted}`}>
        {source === "maree.info" ? "Horaires Saint-Malo à jour" : "Secours local"}
      </p>
    </div>
  );
}
