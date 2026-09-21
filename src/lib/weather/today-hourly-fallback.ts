import type { WeatherHourly } from "@/lib/weather/bulletin";
import type { WeatherIconType } from "@/lib/weather-types";

const HOUR_ICONS: WeatherIconType[] = [
  "cloud-sun",
  "sun",
  "sun",
  "cloud-sun",
  "cloud",
  "cloud-rain",
  "cloud-rain",
  "cloud",
  "cloud-sun",
  "sun",
];

const HOUR_TEMPS = [12, 13, 15, 16, 17, 16, 15, 14, 13, 12];

const HOUR_DESCRIPTIONS: Record<WeatherIconType, string> = {
  sun: "Ensoleillé",
  "cloud-sun": "Éclaircies",
  cloud: "Nuageux",
  "cloud-rain": "Pluie",
};

export function fallbackTodayHourly(dateStr: string): WeatherHourly[] {
  return Array.from({ length: 10 }, (_, i) => {
    const hour = 8 + i;
    const icon = HOUR_ICONS[i] ?? "cloud";
    const temp = HOUR_TEMPS[i] ?? 14;
    const time = `${dateStr}T${String(hour).padStart(2, "0")}:00`;

    return {
      time,
      hourLabel: `${hour}h`,
      icon,
      temp,
      description: HOUR_DESCRIPTIONS[icon],
      precipProbability: icon === "cloud-rain" ? 70 : 20,
    };
  });
}
