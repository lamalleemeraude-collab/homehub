"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Shirt } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { WeatherScene } from "@/components/weather/WeatherScenes";
import { useSaintLunaireWeather } from "@/hooks/useSaintLunaireWeather";
import { outfitAdviceForWeather } from "@/lib/outfit-advice";
import { formatTomorrowLabel } from "@/lib/tomorrow-schedule";
import { PASTEL_GRADIENTS, PASTEL_ICON } from "@/lib/ui/pastel-theme";
import { WEATHER_HINTS } from "@/lib/weather-types";

type OutfitRoutineWidgetProps = {
  variant?: "card" | "tile";
};

export function OutfitRoutineWidget({ variant = "card" }: OutfitRoutineWidgetProps) {
  const { weather } = useSaintLunaireWeather();
  const { epsTomorrow } = outfitAdviceForWeather(weather);
  const { isWeekend } = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDay();
    return { isWeekend: day === 0 || day === 6 };
  }, []);

  const hint = WEATHER_HINTS[weather.icon];

  if (variant === "tile") {
    return (
      <Link
        href="/routine/tenue"
        prefetch
        className="touch-target flex flex-col justify-end gap-1.5 py-0.5 transition-opacity active:opacity-80"
      >
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 text-rose-500/80" strokeWidth={2.25} />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500/80">
            Tenue
          </p>
        </div>
        <p className="text-sm font-bold text-slate-800">
          {isWeekend ? "Repos" : formatTomorrowLabel()}
        </p>
        {!isWeekend && (
          <div className="flex items-center gap-2.5">
            <WeatherScene icon={weather.icon} className="h-9 w-9" />
            <div className="min-w-0">
              <p className="text-2xl font-black tabular-nums leading-none text-slate-900">
                {weather.temp}°
              </p>
              <p className="mt-0.5 max-w-[11rem] truncate text-xs font-medium text-slate-500">
                {epsTomorrow ? "EPS demain" : hint}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" strokeWidth={2.5} />
          </div>
        )}
      </Link>
    );
  }

  return (
    <BentoCard
      variant="gradient"
      gradient={PASTEL_GRADIENTS.outfit}
      className="relative flex h-full flex-col justify-between overflow-hidden p-4 sm:p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${PASTEL_ICON.outfit} shadow-md shadow-rose-200/40`}
          >
            <Shirt className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-800/70">
              Routine du soir
            </p>
            <p className="text-lg font-bold text-slate-800 sm:text-xl">La Tenue</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/50 bg-white/45 p-3 shadow-sm shadow-rose-100/30 backdrop-blur-sm">
          {isWeekend ? (
            <p className="text-base font-semibold text-slate-700">Pas de cours demain 🌴</p>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-800/60">
                {formatTomorrowLabel()} · {weather.location}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/60 shadow-sm">
                  <WeatherScene icon={weather.icon} className="h-10 w-10" />
                </div>
                <div className="min-w-0">
                  <p className="text-3xl font-bold leading-none text-slate-800 sm:text-4xl">
                    {weather.temp}°
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {weather.description}
                  </p>
                  {hint && (
                    <p className="mt-0.5 text-sm font-medium text-rose-800/70">{hint}</p>
                  )}
                  {epsTomorrow && (
                    <p className="mt-1 text-sm font-semibold text-orange-800">
                      Tenue de sport demain
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!isWeekend && (
        <Link
          href="/routine/tenue"
          prefetch
          className="touch-target relative z-20 mt-4 flex min-h-[var(--kiosk-touch-min)] items-center justify-between rounded-2xl border border-white/60 bg-white/90 px-4 shadow-sm shadow-rose-200/25 backdrop-blur-sm active:bg-white"
        >
          <span className="text-base font-bold text-slate-800 sm:text-lg">
            Préparer ma tenue
          </span>
          <ChevronRight className="h-6 w-6 text-rose-400" strokeWidth={2.5} />
        </Link>
      )}
    </BentoCard>
  );
}
