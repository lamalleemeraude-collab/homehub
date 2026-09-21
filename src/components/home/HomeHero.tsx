"use client";

import { useEffect, useMemo, useState } from "react";
import { BentoCard } from "@/components/ui/BentoCard";
import { WeatherScene } from "@/components/weather/WeatherScenes";
import { useWeatherBulletin } from "@/contexts/WeatherBulletinContext";
import { mockWeather } from "@/lib/mock-data";
import { PASTEL_GRADIENTS } from "@/lib/ui/pastel-theme";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function greetingForHour(hour: number): { text: string; emoji: string } {
  if (hour < 6) return { text: "Bonne nuit", emoji: "🌙" };
  if (hour < 12) return { text: "Bonjour", emoji: "☀️" };
  if (hour < 18) return { text: "Salut", emoji: "👋" };
  return { text: "Bonsoir", emoji: "✨" };
}

export function HomeHero() {
  const [now, setNow] = useState<Date | null>(null);
  const { bulletin, openBulletin } = useWeatherBulletin();
  const current = bulletin?.current ?? mockWeather.today;

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const greeting = useMemo(
    () => (now ? greetingForHour(now.getHours()) : { text: "…", emoji: "✨" }),
    [now]
  );

  return (
    <BentoCard
      variant="gradient"
      gradient={PASTEL_GRADIENTS.calendar}
      className="home-hero home-hero-banner relative shrink-0 overflow-hidden px-4 py-4 sm:px-6 sm:py-5"
    >
      <div className="home-hero-orb home-hero-orb-a pointer-events-none" aria-hidden />
      <div className="home-hero-orb home-hero-orb-b pointer-events-none" aria-hidden />
      <div className="home-hero-shimmer pointer-events-none" aria-hidden />

      <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <span className="home-greeting-emoji" aria-hidden>
              {greeting.emoji}
            </span>
            <span>{greeting.text}, Maelle</span>
          </p>
          <p className="home-clock mt-0.5 text-5xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-6xl xl:text-7xl">
            {now ? formatTime(now) : "--:--"}
          </p>
          <p className="mt-1 capitalize text-sm font-medium text-slate-500 sm:text-base">
            {now ? formatDateShort(now) : "…"}
          </p>
        </div>

        <button
          type="button"
          onClick={openBulletin}
          className="home-weather-pill touch-target group flex shrink-0 items-center gap-3 rounded-2xl border border-white/60 bg-white/55 px-3 py-2.5 shadow-sm backdrop-blur-md transition-transform active:scale-[0.98] sm:gap-4 sm:rounded-3xl sm:px-4 sm:py-3"
          aria-label="Ouvrir le bulletin météo expert"
        >
          <span className="home-weather-ring flex h-12 w-12 items-center justify-center rounded-full bg-white/85 sm:h-14 sm:w-14">
            <WeatherScene icon={current.icon} className="h-9 w-9 sm:h-10 sm:w-10" />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-2xl font-bold tabular-nums leading-none text-slate-800 sm:text-3xl">
              {current.temp}°
            </p>
            <p className="mt-0.5 max-w-[7rem] truncate text-xs font-semibold text-sky-800/70 sm:max-w-none sm:text-sm">
              {current.description}
            </p>
            <p className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">
              Bulletin · Saint-Lunaire
            </p>
          </div>
        </button>
      </div>
    </BentoCard>
  );
}
