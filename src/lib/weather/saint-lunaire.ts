import { SAINT_LUNAIRE } from "@/lib/weather/location";
import {
  wmoToDescription,
  wmoToWeatherIcon,
} from "@/lib/outfit-advice";
import type { WeatherData } from "@/lib/weather-types";

export { SAINT_LUNAIRE };

type OpenMeteoDaily = {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
};

type OpenMeteoResponse = {
  daily: OpenMeteoDaily;
};

export async function fetchSaintLunaireTomorrowWeather(): Promise<
  WeatherData & { location: string }
> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(SAINT_LUNAIRE.latitude));
  url.searchParams.set("longitude", String(SAINT_LUNAIRE.longitude));
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "Europe/Paris");
  url.searchParams.set("forecast_days", "2");

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error("Météo indisponible");

  const data = (await res.json()) as OpenMeteoResponse;
  const tomorrowIndex = 1;

  const code = data.daily.weather_code[tomorrowIndex] ?? 2;
  const tempMax = Math.round(data.daily.temperature_2m_max[tomorrowIndex] ?? 15);
  const tempMin = Math.round(data.daily.temperature_2m_min[tomorrowIndex] ?? 10);
  const temp = Math.round((tempMax + tempMin) / 2);

  return {
    location: SAINT_LUNAIRE.name,
    icon: wmoToWeatherIcon(code),
    temp,
    description: wmoToDescription(code),
  };
}
