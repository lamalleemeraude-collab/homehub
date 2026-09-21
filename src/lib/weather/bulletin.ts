import {
  wmoToDescription,
  wmoToWeatherIcon,
} from "@/lib/outfit-advice";
import type { WeatherData, WeatherIconType } from "@/lib/weather-types";
import { SAINT_LUNAIRE } from "@/lib/weather/location";
import { formatWind, msToKmh, windSpeedLabel } from "@/lib/weather/wind";

export type WeatherSnapshot = WeatherData & {
  feelsLike?: number;
  humidity?: number;
  windKmh?: number;
  windGustKmh?: number;
  windDirection?: number;
  precipitationMm?: number;
  precipProbability?: number;
  uvIndex?: number;
  pressureHpa?: number;
};

export type WeatherHourly = WeatherSnapshot & {
  time: string;
  hourLabel: string;
};

export type WeatherDayForecast = {
  date: string;
  weekday: string;
  tempMin: number;
  tempMax: number;
  icon: WeatherIconType;
  description: string;
  precipProbMax: number;
  precipSumMm: number;
  windMaxKmh: number;
  gustMaxKmh: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
};

export type CoastalInsight = {
  headline: string;
  windSummary: string;
  rainOutlook: string;
  gustAlert: boolean;
  umbrellaScore: number;
};

export type WeatherBulletin = {
  location: string;
  updatedAt: string;
  source: "open-meteo" | "fallback";
  coordinates: { lat: number; lon: number };
  current: WeatherSnapshot;
  today: WeatherDayForecast;
  tomorrow: WeatherDayForecast;
  /** Prévisions horaires aujourd'hui (8h → 17h). */
  todayHourly: WeatherHourly[];
  tomorrowHourly: WeatherHourly[];
  week: WeatherDayForecast[];
  coastal: CoastalInsight;
  /** Résumé simple pour widgets (demain). */
  tomorrowSimple: WeatherData & { tempMin: number; tempMax: number };
};

type OpenMeteoCurrent = {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  surface_pressure: number;
  uv_index: number;
};

type OpenMeteoHourly = {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  relative_humidity_2m: number[];
  uv_index: number[];
};

type OpenMeteoDaily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
};

type OpenMeteoResponse = {
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
};

function round(n: number): number {
  return Math.round(n);
}

function formatHour(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function formatWeekday(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    timeZone: "Europe/Paris",
  });
}

function formatSunTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function snapshotFromCode(
  code: number,
  temp: number,
  extra?: Partial<WeatherSnapshot>
): WeatherSnapshot {
  return {
    icon: wmoToWeatherIcon(code),
    temp: round(temp),
    description: wmoToDescription(code),
    ...extra,
  };
}

function parseDay(daily: OpenMeteoDaily, index: number): WeatherDayForecast {
  const code = daily.weather_code[index] ?? 2;
  return {
    date: daily.time[index] ?? "",
    weekday: formatWeekday(daily.time[index] ?? ""),
    tempMin: round(daily.temperature_2m_min[index] ?? 0),
    tempMax: round(daily.temperature_2m_max[index] ?? 0),
    icon: wmoToWeatherIcon(code),
    description: wmoToDescription(code),
    precipProbMax: round(daily.precipitation_probability_max[index] ?? 0),
    precipSumMm: Math.round((daily.precipitation_sum[index] ?? 0) * 10) / 10,
    windMaxKmh: msToKmh(daily.wind_speed_10m_max[index] ?? 0),
    gustMaxKmh: msToKmh(daily.wind_gusts_10m_max[index] ?? 0),
    uvMax: Math.round((daily.uv_index_max[index] ?? 0) * 10) / 10,
    sunrise: formatSunTime(daily.sunrise[index] ?? ""),
    sunset: formatSunTime(daily.sunset[index] ?? ""),
  };
}

function buildCoastalInsight(
  tomorrow: WeatherDayForecast,
  tomorrowHourly: WeatherHourly[]
): CoastalInsight {
  const maxGust = Math.max(
    tomorrow.gustMaxKmh,
    ...tomorrowHourly.map((h) => h.windGustKmh ?? 0)
  );
  const maxRainProb = Math.max(
    tomorrow.precipProbMax,
    ...tomorrowHourly.map((h) => h.precipProbability ?? 0)
  );
  const gustAlert = maxGust >= 50;
  const umbrellaScore = Math.min(
    100,
    Math.round(maxRainProb * 0.7 + (tomorrow.precipSumMm > 2 ? 30 : 0))
  );

  const windSummary = `Vent max ${tomorrow.windMaxKmh} km/h, rafales ${tomorrow.gustMaxKmh} km/h — ${windSpeedLabel(tomorrow.gustMaxKmh)}`;

  let rainOutlook = "Peu de pluie attendue.";
  if (maxRainProb >= 70 || tomorrow.precipSumMm >= 5) {
    rainOutlook = "Forte probabilité de pluie — prévoir imperméable.";
  } else if (maxRainProb >= 40 || tomorrow.precipSumMm >= 1) {
    rainOutlook = "Averses possibles — parapluie conseillé.";
  }

  let headline = "Conditions côtières stables.";
  if (gustAlert) {
    headline = "Attention vent fort sur la côte.";
  } else if (umbrellaScore >= 60) {
    headline = "Journée humide à Saint-Lunaire.";
  } else if (tomorrow.uvMax >= 6) {
    headline = "Ensoleillement marqué — protection solaire.";
  }

  return {
    headline,
    windSummary,
    rainOutlook,
    gustAlert,
    umbrellaScore,
  };
}

function parisHourFromIso(time: string): number {
  const match = time.match(/T(\d{2}):/);
  return match ? Number(match[1]) : 0;
}

function hourlySlotsForDate(
  hourly: OpenMeteoHourly,
  date: string,
  startHour = 8,
  endHour = 17
): WeatherHourly[] {
  const slots: WeatherHourly[] = [];

  for (let i = 0; i < hourly.time.length; i++) {
    const time = hourly.time[i];
    if (!time.startsWith(date)) continue;

    const hour = parisHourFromIso(time);
    if (hour < startHour || hour > endHour) continue;

    const code = hourly.weather_code[i] ?? 2;
    slots.push({
      ...snapshotFromCode(code, hourly.temperature_2m[i] ?? 0, {
        feelsLike: round(hourly.apparent_temperature[i] ?? 0),
        humidity: round(hourly.relative_humidity_2m[i] ?? 0),
        windKmh: msToKmh(hourly.wind_speed_10m[i] ?? 0),
        windGustKmh: msToKmh(hourly.wind_gusts_10m[i] ?? 0),
        precipProbability: round(hourly.precipitation_probability[i] ?? 0),
        precipitationMm: hourly.precipitation[i] ?? 0,
        uvIndex: Math.round((hourly.uv_index[i] ?? 0) * 10) / 10,
      }),
      time,
      hourLabel: formatHour(time),
    });
  }

  return slots;
}

function tomorrowHourlySlots(
  hourly: OpenMeteoHourly,
  tomorrowDate: string
): WeatherHourly[] {
  return hourlySlotsForDate(hourly, tomorrowDate, 6, 20);
}

export async function fetchWeatherBulletin(): Promise<WeatherBulletin> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(SAINT_LUNAIRE.latitude));
  url.searchParams.set("longitude", String(SAINT_LUNAIRE.longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "surface_pressure",
      "uv_index",
    ].join(",")
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_gusts_10m",
      "relative_humidity_2m",
      "uv_index",
    ].join(",")
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(",")
  );
  url.searchParams.set("timezone", "Europe/Paris");
  url.searchParams.set("forecast_days", "7");

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error("Météo indisponible");

  const data = (await res.json()) as OpenMeteoResponse;
  const cur = data.current;

  const current = snapshotFromCode(cur.weather_code, cur.temperature_2m, {
    feelsLike: round(cur.apparent_temperature),
    humidity: round(cur.relative_humidity_2m),
    windKmh: msToKmh(cur.wind_speed_10m),
    windGustKmh: msToKmh(cur.wind_gusts_10m),
    windDirection: cur.wind_direction_10m,
    precipitationMm: cur.precipitation,
    pressureHpa: round(cur.surface_pressure),
    uvIndex: Math.round(cur.uv_index * 10) / 10,
  });

  const today = parseDay(data.daily, 0);
  const tomorrow = parseDay(data.daily, 1);
  const todayDate = data.daily.time[0] ?? "";
  const tomorrowDate = data.daily.time[1] ?? "";
  const todayHourly = hourlySlotsForDate(data.hourly, todayDate, 8, 17);
  const tomorrowHourly = tomorrowHourlySlots(data.hourly, tomorrowDate);

  const week = data.daily.time.map((_, i) => parseDay(data.daily, i));

  const tomorrowTemp = round((tomorrow.tempMin + tomorrow.tempMax) / 2);

  return {
    location: SAINT_LUNAIRE.name,
    updatedAt: new Date().toISOString(),
    source: "open-meteo",
    coordinates: {
      lat: SAINT_LUNAIRE.latitude,
      lon: SAINT_LUNAIRE.longitude,
    },
    current,
    today,
    tomorrow,
    todayHourly,
    tomorrowHourly,
    week,
    coastal: buildCoastalInsight(tomorrow, tomorrowHourly),
    tomorrowSimple: {
      icon: tomorrow.icon,
      temp: tomorrowTemp,
      description: tomorrow.description,
      tempMin: tomorrow.tempMin,
      tempMax: tomorrow.tempMax,
    },
  };
}

export function formatBulletinWind(current: WeatherSnapshot): string {
  if (current.windKmh == null) return "—";
  return formatWind(current.windKmh, current.windDirection);
}
