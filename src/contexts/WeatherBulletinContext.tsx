"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { WeatherBulletin } from "@/lib/weather/bulletin";
import { WeatherBulletinOverlay } from "@/components/weather/WeatherBulletinOverlay";

type WeatherBulletinContextValue = {
  bulletin: WeatherBulletin | null;
  loading: boolean;
  open: boolean;
  openBulletin: () => void;
  closeBulletin: () => void;
  refresh: () => Promise<void>;
};

const WeatherBulletinContext =
  createContext<WeatherBulletinContextValue | null>(null);

export function WeatherBulletinProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bulletin, setBulletin] = useState<WeatherBulletin | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    const isFirstLoad = bulletin === null;
    if (isFirstLoad) setLoading(true);
    try {
      const res = await fetch("/api/weather/bulletin", { cache: "no-store" });
      const data = (await res.json()) as WeatherBulletin;
      setBulletin(data);
    } catch {
      setBulletin(null);
    } finally {
      setLoading(false);
    }
  }, [bulletin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value: WeatherBulletinContextValue = {
    bulletin,
    loading,
    open,
    openBulletin: () => setOpen(true),
    closeBulletin: () => setOpen(false),
    refresh,
  };

  return (
    <WeatherBulletinContext.Provider value={value}>
      {children}
      {open && (
        <WeatherBulletinOverlay
          bulletin={bulletin}
          loading={loading}
          onClose={() => setOpen(false)}
          onRefresh={refresh}
        />
      )}
    </WeatherBulletinContext.Provider>
  );
}

export function useWeatherBulletin() {
  const ctx = useContext(WeatherBulletinContext);
  if (!ctx) {
    throw new Error("useWeatherBulletin must be used within WeatherBulletinProvider");
  }
  return ctx;
}
