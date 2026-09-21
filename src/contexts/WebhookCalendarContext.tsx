"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { webhookCalendarToHubEvents } from "@/lib/iphone-sync/to-hub-events";
import type { HubEvent } from "@/lib/hub-events";

const WEBHOOK_POLL_MS = 30_000;

type WebhookCalendarResponse = {
  syncedAt: string | null;
  events: Parameters<typeof webhookCalendarToHubEvents>[0];
};

type WebhookCalendarContextValue = {
  events: HubEvent[];
  syncedAt: string | null;
  refresh: () => Promise<void>;
};

const WebhookCalendarContext = createContext<WebhookCalendarContextValue | null>(
  null
);

export function WebhookCalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<HubEvent[]>([]);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/webhook-calendar", { cache: "no-store" });
      if (!res.ok) {
        setEvents([]);
        return;
      }

      const data = (await res.json()) as WebhookCalendarResponse;
      setSyncedAt(data.syncedAt);
      setEvents(webhookCalendarToHubEvents(data.events ?? []));
    } catch {
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), WEBHOOK_POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo(
    () => ({ events, syncedAt, refresh }),
    [events, syncedAt, refresh]
  );

  return (
    <WebhookCalendarContext.Provider value={value}>
      {children}
    </WebhookCalendarContext.Provider>
  );
}

export function useWebhookCalendarEvents() {
  const ctx = useContext(WebhookCalendarContext);
  if (!ctx) {
    throw new Error(
      "useWebhookCalendarEvents must be used within WebhookCalendarProvider"
    );
  }
  return ctx;
}
