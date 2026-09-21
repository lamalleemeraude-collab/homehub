"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WeatherScene } from "@/components/weather/WeatherScenes";
import { useWeatherBulletin } from "@/contexts/WeatherBulletinContext";
import { mockWeather } from "@/lib/mock-data";
import { SAINT_LUNAIRE } from "@/lib/weather/location";
import { fallbackTodayHourly } from "@/lib/weather/today-hourly-fallback";
import type { WeatherHourly } from "@/lib/weather/bulletin";
import { homeTone, useHomeNight } from "./HomeNightContext";

function slotHour(time: string): number {
  const match = time.match(/T(\d{2}):/);
  return match ? Number(match[1]) : new Date(time).getHours();
}

function UpcomingHours({
  hours,
  label,
  nowHour,
}: {
  hours: WeatherHourly[];
  label: string;
  nowHour: number;
}) {
  const night = useHomeNight();
  const t = homeTone(night);
  if (hours.length === 0) return null;

  return (
    <div>
      <p className={`mb-3 text-[10px] font-bold uppercase tracking-[0.14em] ${t.muted}`}>
        {label}
      </p>
      <div className="flex gap-5 overflow-x-auto pb-0.5 sm:gap-6">
        {hours.map((slot) => {
          const hour = slotHour(slot.time);
          const isNow = hour === nowHour;
          return (
            <div
              key={slot.time}
              className={`flex min-w-[2.75rem] flex-col items-center gap-1.5 ${
                isNow ? "" : "opacity-80"
              }`}
            >
              <span
                className={`text-[11px] font-bold tabular-nums ${
                  isNow ? t.link : t.muted
                }`}
              >
                {isNow ? "Maintenant" : `${hour}h`}
              </span>
              <WeatherScene icon={slot.icon} className="h-9 w-9 sm:h-10 sm:w-10" />
              <span
                className={`text-sm font-medium tabular-nums ${
                  isNow ? t.ink : t.soft
                }`}
              >
                {slot.temp}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Météo organisée : Maintenant | Demain, puis les prochaines heures utiles. */
export function HomeWeatherHud() {
  const night = useHomeNight();
  const t = homeTone(night);
  const { bulletin, openBulletin } = useWeatherBulletin();
  const [nowHour, setNowHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const id = setInterval(() => setNowHour(new Date().getHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  const current = bulletin?.current ?? mockWeather.today;
  const tomorrow = bulletin?.tomorrow;
  const todayHourly =
    bulletin?.todayHourly ??
    fallbackTodayHourly(new Date().toISOString().slice(0, 10));
  const tomorrowHourly = bulletin?.tomorrowHourly ?? [];

  const feelsLike =
    "feelsLike" in current && current.feelsLike != null
      ? current.feelsLike
      : undefined;

  const upcoming = useMemo(() => {
    const restToday = todayHourly.filter((h) => slotHour(h.time) >= nowHour);
    if (restToday.length >= 3) {
      return {
        label: "Heures à venir",
        hours: restToday.slice(0, 8),
      };
    }
    const morning = tomorrowHourly
      .filter((h) => {
        const hNum = slotHour(h.time);
        return hNum >= 7 && hNum <= 14;
      })
      .slice(0, 8);
    if (morning.length > 0) {
      return { label: "Demain matin", hours: morning };
    }
    return {
      label: "Heures à venir",
      hours: todayHourly.slice(-6),
    };
  }, [todayHourly, tomorrowHourly, nowHour]);

  return (
    <section className="home-weather-hud flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10 lg:gap-16">
        <motion.button
          type="button"
          onClick={openBulletin}
          className="touch-target flex items-center gap-4 text-left sm:gap-5"
          whileTap={{ scale: 0.99 }}
          aria-label="Bulletin météo Saint-Lunaire"
        >
          <WeatherScene
            icon={current.icon}
            className="h-16 w-16 shrink-0 sm:h-[4.5rem] sm:w-[4.5rem]"
          />
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${t.muted}`}>
              Maintenant
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
              <span
                className={`home-clock-glow text-4xl font-medium tabular-nums leading-none sm:text-5xl ${t.ink}`}
              >
                {current.temp}°
              </span>
              <span className={`text-base font-bold sm:text-lg ${t.soft}`}>
                {current.description}
              </span>
            </p>
            {feelsLike != null && feelsLike !== current.temp && (
              <p className={`mt-1 text-sm font-medium ${t.muted}`}>
                Ressenti {feelsLike}°
              </p>
            )}
            <p className={`mt-0.5 text-xs font-medium opacity-90 ${t.muted}`}>
              {SAINT_LUNAIRE.name}
            </p>
          </div>
        </motion.button>

        {tomorrow && (
          <div className="flex items-center gap-4 sm:justify-end sm:gap-5">
            <div className="min-w-0 text-left sm:text-right">
              <p className={`text-[10px] font-bold uppercase tracking-[0.14em] ${t.muted}`}>
                Demain
              </p>
              <p className={`mt-1 text-3xl font-medium tabular-nums leading-none sm:text-4xl ${t.ink}`}>
                {tomorrow.tempMin}°–{tomorrow.tempMax}°
              </p>
              <p className={`mt-1 text-base font-bold ${t.soft}`}>
                {tomorrow.description}
              </p>
            </div>
            <WeatherScene
              icon={tomorrow.icon}
              className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"
            />
          </div>
        )}
      </div>

      <UpcomingHours
        hours={upcoming.hours}
        label={upcoming.label}
        nowHour={nowHour}
      />
    </section>
  );
}
