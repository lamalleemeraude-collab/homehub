"use client";

import { useMemo } from "react";
import { CheckCheck, CheckCircle } from "lucide-react";
import { OutfitItemRow } from "@/components/routine/OutfitItemRow";
import { TouchButton } from "@/components/ui/TouchButton";
import { WeatherScene } from "@/components/weather/WeatherScenes";
import { useSaintLunaireWeather } from "@/hooks/useSaintLunaireWeather";
import { outfitAdviceForWeather } from "@/lib/outfit-advice";
import { formatTomorrowLabel } from "@/lib/tomorrow-schedule";
import { WEATHER_HINTS } from "@/lib/weather-types";

type OutfitStepProps = {
  checked: Set<string>;
  onToggle: (id: string) => void;
  onCheckMany: (ids: string[]) => void;
  onFinish: () => void;
};

export function OutfitStep({
  checked,
  onToggle,
  onCheckMany,
  onFinish,
}: OutfitStepProps) {
  const { weather } = useSaintLunaireWeather();
  const { advice, items, epsTomorrow } = outfitAdviceForWeather(weather);
  const hint = WEATHER_HINTS[weather.icon];

  const { epsItems, weatherItems } = useMemo(() => {
    const eps = items.filter((i) => i.id.startsWith("eps-"));
    const rest = items.filter((i) => !i.id.startsWith("eps-"));
    return { epsItems: eps, weatherItems: rest };
  }, [items]);

  const checkedCount = items.filter((i) => checked.has(i.id)).length;
  const allChecked = items.length > 0 && checkedCount === items.length;
  const progress = items.length
    ? Math.round((checkedCount / items.length) * 100)
    : 0;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <div className="shrink-0">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-800/60">
              Routine du soir
            </p>
            <h2 className="text-2xl font-black text-slate-800 sm:text-3xl">
              La Tenue
            </h2>
            <p className="mt-0.5 text-sm font-medium text-slate-500 sm:text-base">
              {formatTomorrowLabel()} · {weather.location}
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold tabular-nums text-slate-500">
            {checkedCount}/{items.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/50">
          <div
            className="h-full rounded-full bg-rose-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="shrink-0 rounded-2xl border border-white/50 bg-white/45 p-3 shadow-sm shadow-rose-100/20 backdrop-blur-sm sm:p-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/70 ring-1 ring-white/80 sm:h-16 sm:w-16">
            <WeatherScene icon={weather.icon} className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-3xl font-bold tabular-nums leading-none text-slate-800 sm:text-4xl">
              {weather.temp}°
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">
              {weather.description}
            </p>
            {hint && (
              <p className="mt-0.5 text-xs font-medium text-rose-800/65 sm:text-sm">
                {hint}
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-rose-50/80 px-3 py-2 text-sm font-semibold leading-snug text-rose-900 ring-1 ring-rose-100/80 sm:text-base">
          {advice}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-0.5">
        {epsTomorrow && epsItems.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between px-0.5">
              <h3 className="text-sm font-bold text-slate-700 sm:text-base">
                👟 EPS demain
              </h3>
              <TouchButton
                ariaLabel="Tout cocher EPS"
                onClick={() => onCheckMany(epsItems.map((i) => i.id))}
                className="rounded-lg px-2 py-1 text-xs font-bold text-rose-600 active:bg-white/60"
              >
                Tout cocher
              </TouchButton>
            </div>
            <ul className="space-y-2">
              {epsItems.map((item) => (
                <li key={item.id}>
                  <OutfitItemRow
                    label={item.label}
                    checked={checked.has(item.id)}
                    onToggle={() => onToggle(item.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {weatherItems.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between px-0.5">
              <h3 className="text-sm font-bold text-slate-700 sm:text-base">
                {epsTomorrow ? "🌤 Selon la météo" : "À préparer"}
              </h3>
              <TouchButton
                ariaLabel="Tout cocher tenue"
                onClick={() => onCheckMany(weatherItems.map((i) => i.id))}
                className="rounded-lg px-2 py-1 text-xs font-bold text-rose-600 active:bg-white/60"
              >
                Tout cocher
              </TouchButton>
            </div>
            <ul className="space-y-2">
              {weatherItems.map((item) => (
                <li key={item.id}>
                  <OutfitItemRow
                    label={item.label}
                    checked={checked.has(item.id)}
                    onToggle={() => onToggle(item.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        <TouchButton
          ariaLabel="Tout cocher"
          onClick={() => onCheckMany(items.map((i) => i.id))}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/70 px-3 py-3 text-sm font-bold text-slate-600 ring-1 ring-white/80 active:bg-white sm:py-3.5"
        >
          <CheckCheck className="h-4 w-4" strokeWidth={2.5} />
          Tout
        </TouchButton>
        <TouchButton
          ariaLabel="Tenue prête"
          onClick={onFinish}
          disabled={!allChecked}
          className="touch-target flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-400 text-lg font-black text-white disabled:opacity-40 active:bg-rose-500 sm:min-h-[56px] sm:text-xl"
        >
          <CheckCircle className="h-6 w-6" strokeWidth={2.5} />
          Tenue prête !
        </TouchButton>
      </div>
    </div>
  );
}
