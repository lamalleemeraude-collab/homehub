import type { WeatherBulletin } from "@/lib/weather/bulletin";
import { mockWeather } from "@/lib/mock-data";
import { SAINT_LUNAIRE } from "@/lib/weather/location";
import { fallbackTodayHourly } from "@/lib/weather/today-hourly-fallback";

export function fallbackWeatherBulletin(): WeatherBulletin {
  const now = new Date().toISOString();
  const todayStr = now.slice(0, 10);

  const baseDay = {
    date: todayStr,
    weekday: "auj.",
    precipProbMax: 40,
    precipSumMm: 0,
    windMaxKmh: 25,
    gustMaxKmh: 35,
    uvMax: 4,
    sunrise: "07:45",
    sunset: "20:30",
  };

  return {
    location: "Saint-Lunaire",
    updatedAt: now,
    source: "fallback",
    coordinates: {
      lat: SAINT_LUNAIRE.latitude,
      lon: SAINT_LUNAIRE.longitude,
    },
    current: {
      ...mockWeather.today,
      feelsLike: mockWeather.today.temp - 1,
      humidity: 65,
      windKmh: 18,
      windGustKmh: 28,
      windDirection: 225,
      pressureHpa: 1015,
      uvIndex: 2,
    },
    today: {
      ...baseDay,
      tempMin: 14,
      tempMax: 20,
      icon: mockWeather.today.icon,
      description: mockWeather.today.description,
    },
    tomorrow: {
      ...baseDay,
      date: todayStr,
      weekday: "dem.",
      tempMin: 10,
      tempMax: 14,
      icon: mockWeather.tomorrow.icon,
      description: mockWeather.tomorrow.description,
      precipProbMax: 75,
      precipSumMm: 4,
    },
    tomorrowHourly: [],
    todayHourly: fallbackTodayHourly(todayStr),
    week: [],
    coastal: {
      headline: "Données estimées (hors ligne)",
      windSummary: "Vent côtier modéré",
      rainOutlook: "Consultez la météo en ligne",
      gustAlert: false,
      umbrellaScore: 50,
    },
    tomorrowSimple: {
      ...mockWeather.tomorrow,
      tempMin: 10,
      tempMax: 14,
    },
  };
}
