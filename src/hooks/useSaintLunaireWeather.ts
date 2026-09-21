"use client";

import { useCallback, useEffect, useState } from "react";
import { mockWeather } from "@/lib/mock-data";
import { HUB_REFRESH_EVENT } from "@/lib/hub-refresh";
import type { WeatherData } from "@/lib/weather-types";

export type SaintLunaireTomorrow = WeatherData & {
  location: string;
  tempMin?: number;
  tempMax?: number;
};

type SaintLunaireApiResponse = {
  location: string;
  tomorrow: WeatherData & { tempMin: number; tempMax: number };
};

const FALLBACK: SaintLunaireTomorrow = {
  ...mockWeather.tomorrow,
  location: "Saint-Lunaire",
  tempMin: 10,
  tempMax: 14,
};

export function useSaintLunaireWeather() {
  const [weather, setWeather] = useState<SaintLunaireTomorrow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weather/saint-lunaire");
      const data = (await res.json()) as SaintLunaireApiResponse;
      setWeather({
        ...data.tomorrow,
        location: data.location,
      });
    } catch {
      setWeather(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onHubRefresh = () => void refresh();
    window.addEventListener(HUB_REFRESH_EVENT, onHubRefresh);
    return () => window.removeEventListener(HUB_REFRESH_EVENT, onHubRefresh);
  }, [refresh]);

  return {
    weather: weather ?? FALLBACK,
    loading,
    refresh,
  };
}
