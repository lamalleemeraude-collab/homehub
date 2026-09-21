"use client";

import { useEffect, useState } from "react";
import { useWeatherBulletin } from "@/contexts/WeatherBulletinContext";
import { mockWeather } from "@/lib/mock-data";
import type { WeatherIconType } from "@/lib/weather-types";

type SkyPalette = {
  from: string;
  via: string;
  to: string;
  glow: string;
  sun: boolean;
  moon: boolean;
  night: boolean;
};

function skyPalette(icon: WeatherIconType, hour: number): SkyPalette {
  const night = hour < 7 || hour >= 20;
  const dusk = (hour >= 7 && hour < 9) || (hour >= 18 && hour < 20);

  if (night) {
    // Noir profond + ciel étoilé
    return {
      from: "#000000",
      via: "#020617",
      to: "#0a0f1f",
      glow: "rgb(129 140 248 / 0.18)",
      sun: false,
      moon: true,
      night: true,
    };
  }

  if (icon === "cloud-rain") {
    return {
      from: "#64748b",
      via: "#94a3b8",
      to: "#cbd5e1",
      glow: "rgb(148 163 184 / 0.35)",
      sun: false,
      moon: false,
      night: false,
    };
  }

  if (icon === "cloud" || icon === "cloud-sun") {
    return {
      from: dusk ? "#fdba74" : "#7dd3fc",
      via: dusk ? "#fed7aa" : "#bae6fd",
      to: dusk ? "#ffedd5" : "#e0f2fe",
      glow: dusk ? "rgb(251 146 60 / 0.35)" : "rgb(253 224 71 / 0.4)",
      sun: true,
      moon: false,
      night: false,
    };
  }

  return {
    from: dusk ? "#fb923c" : "#38bdf8",
    via: dusk ? "#fdba74" : "#7dd3fc",
    to: dusk ? "#fef3c7" : "#fef9c3",
    glow: dusk ? "rgb(249 115 22 / 0.45)" : "rgb(250 204 21 / 0.55)",
    sun: true,
    moon: false,
    night: false,
  };
}

export function WeatherAmbientSky() {
  const { bulletin } = useWeatherBulletin();
  const current = bulletin?.current ?? mockWeather.today;
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const tick = () => setHour(new Date().getHours());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const palette = skyPalette(current.icon, hour);
  const raining = current.icon === "cloud-rain" && !palette.night;
  const cloudy =
    !palette.night &&
    (current.icon === "cloud" ||
      current.icon === "cloud-sun" ||
      current.icon === "cloud-rain");

  return (
    <div
      className={`weather-ambient pointer-events-none absolute inset-0 overflow-hidden ${
        palette.night ? "weather-ambient--night" : ""
      }`}
      aria-hidden
    >
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: palette.night
            ? `radial-gradient(ellipse 90% 55% at 75% -5%, #1e1b4b 0%, transparent 50%),
               radial-gradient(ellipse 70% 40% at 20% 10%, #0f172a 0%, transparent 45%),
               linear-gradient(180deg, #000000 0%, #020617 55%, #050a14 100%)`
            : `linear-gradient(165deg, ${palette.from} 0%, ${palette.via} 42%, ${palette.to} 100%)`,
        }}
      />

      <div
        className="weather-ambient__glow absolute -right-[18%] -top-[20%] h-[55vmin] w-[55vmin] rounded-full blur-3xl"
        style={{
          background: palette.glow,
          opacity: palette.night ? 0.55 : 0.7,
        }}
      />

      {palette.sun && (
        <div className="weather-ambient__sun absolute -right-4 top-0 opacity-80 sm:right-[2%] sm:top-[2%]">
          <div className="relative h-28 w-28 sm:h-40 sm:w-40 lg:h-48 lg:w-48">
            <div className="weather-ambient__sun-core absolute inset-[22%] rounded-full" />
            <div className="weather-ambient__sun-rays absolute inset-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="weather-ambient__ray"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {palette.moon && (
        <>
          <div className="weather-ambient__moon absolute right-[7%] top-[5%] h-[4.5rem] w-[4.5rem] rounded-full sm:h-28 sm:w-28" />
          <div className="weather-ambient__stars absolute inset-0" />
          <div className="weather-ambient__stars weather-ambient__stars--b absolute inset-0" />
        </>
      )}

      {cloudy && (
        <>
          <div className="weather-ambient__cloud weather-ambient__cloud--a" />
          <div className="weather-ambient__cloud weather-ambient__cloud--b" />
          <div className="weather-ambient__cloud weather-ambient__cloud--c" />
        </>
      )}

      {raining && (
        <div className="weather-ambient__rain">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="weather-ambient__drop"
              style={{
                left: `${(i * 3.7) % 100}%`,
                animationDelay: `${(i % 8) * 0.18}s`,
                animationDuration: `${1.1 + (i % 5) * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Voile lisibilité — nuit : garde la profondeur, adoucit juste le bas */}
      <div
        className={`absolute inset-0 ${
          palette.night
            ? "bg-gradient-to-b from-transparent via-black/25 to-white/35"
            : "bg-gradient-to-b from-white/10 via-white/25 to-white/55"
        }`}
      />
    </div>
  );
}
