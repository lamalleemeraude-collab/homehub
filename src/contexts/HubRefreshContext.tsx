"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useCalendarEventsContext } from "@/contexts/CalendarEventsContext";
import { useWebhookCalendarEvents } from "@/contexts/WebhookCalendarContext";
import { useWeatherBulletin } from "@/contexts/WeatherBulletinContext";
import { dispatchHubRefresh } from "@/lib/hub-refresh";

export type HubRefreshStatus = "idle" | "syncing" | "success";

type HubRefreshContextValue = {
  status: HubRefreshStatus;
  refreshAll: () => Promise<void>;
};

const HubRefreshContext = createContext<HubRefreshContextValue | null>(null);

const SUCCESS_MS = 1_400;

export function HubRefreshProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const calendar = useCalendarEventsContext();
  const webhook = useWebhookCalendarEvents();
  const weather = useWeatherBulletin();
  const [status, setStatus] = useState<HubRefreshStatus>("idle");
  const busyRef = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshAll = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }

    setStatus("syncing");
    dispatchHubRefresh();

    try {
      await Promise.all([
        calendar.refresh({ force: true }),
        webhook.refresh(),
        weather.refresh(),
      ]);
      router.refresh();
      setStatus("success");
      successTimerRef.current = setTimeout(() => {
        setStatus("idle");
        successTimerRef.current = null;
      }, SUCCESS_MS);
    } catch {
      setStatus("idle");
    } finally {
      busyRef.current = false;
    }
  }, [calendar, webhook, weather, router]);

  return (
    <HubRefreshContext.Provider value={{ status, refreshAll }}>
      {children}
    </HubRefreshContext.Provider>
  );
}

export function useHubRefresh() {
  const ctx = useContext(HubRefreshContext);
  if (!ctx) {
    throw new Error("useHubRefresh must be used within HubRefreshProvider");
  }
  return ctx;
}
