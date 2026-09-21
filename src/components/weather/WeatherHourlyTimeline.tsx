"use client";

import { useMemo } from "react";
import type { WeatherHourly } from "@/lib/weather/bulletin";
import { WeatherScene } from "@/components/weather/WeatherScenes";

type WeatherHourlyTimelineProps = {
  hours: WeatherHourly[];
  now?: Date;
};

function slotHour(time: string): number {
  const match = time.match(/T(\d{2}):/);
  return match ? Number(match[1]) : new Date(time).getHours();
}

export function WeatherHourlyTimeline({
  hours,
  now = new Date(),
}: WeatherHourlyTimelineProps) {
  const currentHour = now.getHours();

  const slots = useMemo(() => {
    const source =
      hours.length > 0
        ? hours
        : Array.from({ length: 10 }, (_, i) => {
            const hour = 8 + i;
            return {
              time: `${now.toISOString().slice(0, 10)}T${String(hour).padStart(2, "0")}:00`,
              hourLabel: `${hour}h`,
              icon: "cloud" as const,
              temp: 0,
              description: "—",
            };
          });

    // Affiche à partir de l'heure actuelle (heures à venir + maintenant)
    const fromNow = source.filter((s) => slotHour(s.time) >= currentHour);
    return (fromNow.length > 0 ? fromNow : source).slice(0, 8);
  }, [hours, now, currentHour]);

  return (
    <div className="weather-hourly-timeline min-w-0">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500/80">
        Heures à venir
      </p>

      {/* Pas de ligne horizontale — colonnes aérées uniquement */}
      <div className="weather-hscroll flex gap-4 overflow-x-auto pb-1 sm:gap-5 lg:gap-6">
        {slots.map((slot) => {
          const hour = slotHour(slot.time);
          const isNow = hour === currentHour;

          return (
            <div
              key={slot.time}
              className={`flex min-w-[3.25rem] flex-col items-center gap-2 ${
                isNow ? "" : "opacity-70"
              }`}
            >
              <span
                className={`text-[11px] font-bold tabular-nums ${
                  isNow ? "text-sky-800" : "text-slate-500"
                }`}
              >
                {isNow ? "Maintenant" : `${hour}h`}
              </span>
              <WeatherScene icon={slot.icon} className="h-10 w-10 sm:h-11 sm:w-11" />
              <span
                className={`text-sm font-black tabular-nums ${
                  isNow ? "text-slate-900" : "text-slate-600"
                }`}
              >
                {slot.temp}°
              </span>
              {isNow && (
                <span className="h-1 w-1 rounded-full bg-sky-500" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
