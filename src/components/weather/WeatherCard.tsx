import type { WeatherIconType } from "@/lib/weather-types";
import { WEATHER_HINTS } from "@/lib/weather-types";
import { WeatherScene } from "./WeatherScenes";

type WeatherCardProps = {
  label?: string;
  temp: number;
  description: string;
  icon: WeatherIconType;
  variant?: "dark" | "light";
  size?: "sm" | "lg";
  showHint?: boolean;
};

const SCENE_SIZE = { sm: "h-16 w-16", lg: "h-28 w-28 md:h-32 md:w-32" } as const;

const BG_GRADIENT: Record<WeatherIconType, string> = {
  "cloud-rain": "from-sky-600 via-cyan-700 to-indigo-900",
  "cloud-sun": "from-amber-400 via-orange-400 to-sky-500",
  sun: "from-yellow-300 via-amber-400 to-orange-500",
  cloud: "from-slate-400 via-slate-500 to-slate-700",
};

const BG_GRADIENT_LIGHT: Record<WeatherIconType, string> = {
  "cloud-rain": "from-sky-100/90 via-cyan-50/80 to-indigo-100/70",
  "cloud-sun": "from-amber-50/90 via-sky-50/80 to-violet-100/60",
  sun: "from-yellow-50/90 via-orange-50/70 to-rose-50/60",
  cloud: "from-slate-100/90 via-slate-50/80 to-blue-50/50",
};

export function WeatherCard({
  label,
  temp,
  description,
  icon,
  variant = "dark",
  size = "lg",
  showHint = false,
}: WeatherCardProps) {
  const isDark = variant === "dark";
  const hint = WEATHER_HINTS[icon];

  return (
    <div
      className={`weather-card relative overflow-hidden rounded-2xl ${
        isDark
          ? `weather-card-dark bg-gradient-to-br ${BG_GRADIENT[icon]} p-5 text-white`
          : `weather-card-light bg-gradient-to-br ${BG_GRADIENT_LIGHT[icon]} border border-white/70 p-4 text-slate-800`
      }`}
    >
      {/* Ambient orbs */}
      {isDark && (
        <>
          <div className="weather-orb weather-orb-a pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="weather-orb weather-orb-b pointer-events-none absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-cyan-300/20 blur-xl" />
        </>
      )}

      <div className="relative flex items-center gap-4">
        <div
          className={`weather-icon-wrap weather-scene flex shrink-0 items-center justify-center rounded-2xl ${
            isDark
              ? "bg-white/15 p-2 shadow-inner backdrop-blur-md"
              : "bg-white/85 p-2 ring-1 ring-slate-200/30"
          }`}
        >
          <WeatherScene icon={icon} className={SCENE_SIZE[size]} />
        </div>

        <div className="min-w-0 flex-1">
          {label && (
            <p
              className={`mb-1 text-xs font-bold uppercase tracking-widest ${
                isDark ? "text-white/70" : "text-slate-500"
              }`}
            >
              {label}
            </p>
          )}
          <p
            className={`weather-temp font-black leading-none tracking-tight ${
              size === "lg" ? "text-5xl md:text-6xl" : "text-3xl"
            } ${isDark ? "text-white drop-shadow-md" : "text-slate-900"}`}
          >
            {temp}°
          </p>
          <p
            className={`mt-1 font-semibold ${
              size === "lg" ? "text-xl" : "text-base"
            } ${isDark ? "text-white/90" : "text-slate-600"}`}
          >
            {description}
          </p>
          {showHint && hint && (
            <p
              className={`mt-2 text-sm font-medium ${
                isDark ? "text-cyan-100/90" : "text-sky-600"
              }`}
            >
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
