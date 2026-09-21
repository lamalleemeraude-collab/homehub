"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Shirt } from "lucide-react";
import { WeatherScene } from "@/components/weather/WeatherScenes";
import { homeTone, useHomeNight } from "./HomeNightContext";
import { useSaintLunaireWeather } from "@/hooks/useSaintLunaireWeather";
import { outfitAdviceForWeather } from "@/lib/outfit-advice";
import { formatTomorrowLabel } from "@/lib/tomorrow-schedule";
import { WEATHER_HINTS } from "@/lib/weather-types";
import {
  currentTideCoefficient,
  currentTidePhase,
  formatTideHeight,
  formatTideTime,
  getCurrentTideHeight,
  getTideWaterLevel,
  getUpcomingTides,
} from "@/lib/tides/saint-lunaire";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Bandeau unique : heure · marée · tenue — une seule ligne de lecture. */
export function HomeTopBar() {
  const night = useHomeNight();
  const [now, setNow] = useState<Date | null>(null);
  const { weather } = useSaintLunaireWeather();
  const { epsTomorrow } = outfitAdviceForWeather(weather);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const tides = useMemo(() => (now ? getUpcomingTides(now, 1) : []), [now]);
  const phase = useMemo(
    () => (now ? currentTidePhase(now) : "rising"),
    [now]
  );
  const waterLevel = useMemo(
    () => (now ? getTideWaterLevel(now) : 0.35),
    [now]
  );
  const height = useMemo(
    () => (now ? getCurrentTideHeight(now) : 0),
    [now]
  );
  const coefficient = useMemo(
    () => (now ? currentTideCoefficient(now) : undefined),
    [now]
  );

  const isWeekend = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    const d = t.getDay();
    return d === 0 || d === 6;
  }, []);

  const next = tides[0];
  const fillPct = Math.round(waterLevel * 100);
  const hint = WEATHER_HINTS[weather.icon];

  const { ink, soft, muted, accent } = homeTone(night);

  return (
    <header className="home-top-bar flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p
            className={`text-[3rem] font-medium leading-none tabular-nums tracking-tight sm:text-[3.5rem] lg:text-6xl ${ink}`}
          >
            {now ? formatTime(now) : "--:--"}
          </p>
          <p className={`mt-1.5 capitalize text-sm font-medium sm:text-base ${soft}`}>
            {now ? formatDateLong(now) : "…"}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-end justify-end gap-x-10 gap-y-4">
          <div className="min-w-[11rem] max-w-xs flex-1 sm:min-w-[14rem]">
            <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${accent}`}>
              Marée
              {coefficient != null ? ` · coeff. ${coefficient}` : ""}
            </p>
            <p className={`mt-1 flex flex-wrap items-baseline gap-x-2 ${ink}`}>
              <span className="text-2xl font-black tabular-nums sm:text-3xl">
                {now ? formatTideHeight(height) : "…"}
              </span>
              <span className={`text-sm font-bold ${accent}`}>
                {phase === "rising" ? "↗ Montante" : "↘ Descendante"}
              </span>
            </p>
            {next && (
              <p className={`mt-0.5 text-sm font-semibold ${muted}`}>
                Prochaine {next.type === "high" ? "PM" : "BM"}{" "}
                <span className={`font-black tabular-nums ${ink}`}>
                  {formatTideTime(next.time)}
                </span>
              </p>
            )}
            <div className="tide-level-track relative mt-2 h-3 overflow-hidden rounded-full">
              <div
                className="tide-bay__water absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${Math.max(10, fillPct)}%` }}
              />
            </div>
          </div>

          <Link
            href="/routine/tenue"
            prefetch
            className="touch-target flex min-w-[10rem] items-center gap-3 transition-opacity active:opacity-80"
          >
            <div>
              <p className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${muted}`}>
                <Shirt className="h-3.5 w-3.5 text-rose-400" strokeWidth={2.25} />
                Tenue
              </p>
              <p className={`mt-1 text-sm font-bold ${ink}`}>
                {isWeekend ? "Repos" : formatTomorrowLabel()}
              </p>
              {!isWeekend && (
                <p className={`mt-0.5 max-w-[12rem] truncate text-xs font-medium ${muted}`}>
                  {weather.temp}° · {epsTomorrow ? "EPS demain" : hint}
                </p>
              )}
            </div>
            {!isWeekend && (
              <WeatherScene icon={weather.icon} className="h-10 w-10 shrink-0" />
            )}
            <ChevronRight className={`h-4 w-4 shrink-0 ${muted}`} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
