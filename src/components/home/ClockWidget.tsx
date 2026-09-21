"use client";

import { useEffect, useState } from "react";
import { BentoCard } from "@/components/ui/BentoCard";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { useWeatherBulletin } from "@/contexts/WeatherBulletinContext";
import { mockWeather } from "@/lib/mock-data";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null);
  const { bulletin, openBulletin } = useWeatherBulletin();
  const current = bulletin?.current ?? mockWeather.today;

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BentoCard className="flex h-full flex-col justify-between p-4 sm:p-5 md:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 sm:text-sm">
          Aujourd&apos;hui
        </p>
        <p className="mt-1 text-5xl font-bold tabular-nums tracking-tight text-slate-800 sm:text-6xl lg:text-7xl">
          {now ? formatTime(now) : "--:--"}
        </p>
        <p className="mt-1 text-lg font-bold capitalize text-slate-500 sm:text-xl">
          {now ? formatDate(now) : "..."}
        </p>
      </div>

      <button
        type="button"
        onClick={openBulletin}
        className="mt-3 w-full text-left sm:mt-4"
        aria-label="Ouvrir le bulletin météo expert"
      >
        <WeatherCard
          temp={current.temp}
          description={current.description}
          icon={current.icon}
          variant="light"
          size="sm"
        />
        <p className="mt-1.5 text-center text-xs font-semibold text-sky-600/80">
          Bulletin expert · Saint-Lunaire
        </p>
      </button>
    </BentoCard>
  );
}
