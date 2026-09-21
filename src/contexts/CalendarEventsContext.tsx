"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  icalToHubEvents,
  mergeHubEvents,
  type HubEvent,
  type HubEventType,
} from "@/lib/hub-events";
import {
  CALENDAR_FOCUS_DEBOUNCE_MS,
  CALENDAR_POLL_FAST_MS,
  CALENDAR_POLL_INTERVAL_MS,
} from "@/lib/calendar/types";

export type CalendarSyncStatus = "idle" | "syncing" | "live" | "error";

export type CalendarSourceStatus = {
  id: string;
  label: string;
  account: "iCloud" | "Exchange" | "Autres";
  iphoneName: string;
  configured: boolean;
  eventCount: number;
  error?: string | boolean | null;
};

type CalendarEventsContextValue = {
  events: HubEvent[];
  sources: CalendarSourceStatus[];
  syncStatus: CalendarSyncStatus;
  lastSyncedAt: Date | null;
  refresh: (options?: { force?: boolean; silent?: boolean }) => Promise<void>;
};

const CalendarEventsContext = createContext<CalendarEventsContextValue | null>(
  null
);

type SyncSourcePayload = {
  id: string;
  label: string;
  account: "iCloud" | "Exchange" | "Autres";
  iphoneName: string;
  configured: boolean;
  events: {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay?: boolean;
  }[];
  syncedAt?: string;
  error?: string | boolean | null;
};

type SyncApiResponse = {
  syncedAt: string;
  sources: SyncSourcePayload[];
};

const HUB_TYPES = new Set<HubEventType>([
  "maelle",
  "papa",
  "roulle",
]);

function isHubEventType(id: string): id is HubEventType {
  return HUB_TYPES.has(id as HubEventType);
}

async function fetchAllCalendars(options?: { force?: boolean }): Promise<{
  events: HubEvent[];
  sources: CalendarSourceStatus[];
  syncedAt: string | null;
  hasError: boolean;
}> {
  const url = options?.force
    ? `/api/calendar/sync?refresh=1&_=${Date.now()}`
    : "/api/calendar/sync";

  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
    if (!res.ok) {
      return { events: [], sources: [], syncedAt: null, hasError: true };
    }

    const data = (await res.json()) as SyncApiResponse;
    const groups: HubEvent[][] = [];
    const sources: CalendarSourceStatus[] = (data.sources ?? []).map(
      (source) => ({
        id: source.id,
        label: source.label,
        account: source.account,
        iphoneName: source.iphoneName,
        configured: source.configured,
        eventCount: source.events?.length ?? 0,
        error: source.error,
      })
    );

    for (const source of data.sources ?? []) {
      if (!isHubEventType(source.id)) continue;
      if (!source.configured || !source.events?.length) continue;
      groups.push(icalToHubEvents(source.events, source.id, source.id));
    }

    const hasError = (data.sources ?? []).some(
      (s) => s.configured && s.error && (!s.events || s.events.length === 0)
    );

    return {
      events: mergeHubEvents(...groups),
      sources,
      syncedAt: data.syncedAt ?? null,
      hasError,
    };
  } catch {
    return { events: [], sources: [], syncedAt: null, hasError: true };
  }
}

type CalendarEventsProviderProps = {
  children: ReactNode;
  pollIntervalMs?: number;
  pollFastIntervalMs?: number;
};

export function CalendarEventsProvider({
  children,
  pollIntervalMs = Number(process.env.NEXT_PUBLIC_CALENDAR_POLL_MS) ||
    CALENDAR_POLL_INTERVAL_MS,
  pollFastIntervalMs = Number(process.env.NEXT_PUBLIC_CALENDAR_POLL_FAST_MS) ||
    CALENDAR_POLL_FAST_MS,
}: CalendarEventsProviderProps) {
  const pathname = usePathname();
  const onCalendarPage = pathname.startsWith("/calendar");

  const [events, setEvents] = useState<HubEvent[]>([]);
  const [sources, setSources] = useState<CalendarSourceStatus[]>([]);
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const syncingRef = useRef(false);
  const lastSyncAttemptRef = useRef(0);

  const refresh = useCallback(async (options?: { force?: boolean; silent?: boolean }) => {
    if (syncingRef.current && !options?.force) return;

    syncingRef.current = true;
    lastSyncAttemptRef.current = Date.now();
    if (!options?.silent) {
      setSyncStatus("syncing");
    }

    try {
      const calendarResult = await fetchAllCalendars({
        force: options?.force,
      });

      setEvents(calendarResult.events);
      setSources(calendarResult.sources);
      setLastSyncedAt(
        calendarResult.syncedAt ? new Date(calendarResult.syncedAt) : new Date()
      );
      setSyncStatus(
        calendarResult.hasError && calendarResult.events.length === 0
          ? "error"
          : "live"
      );
    } catch {
      setSyncStatus("error");
    } finally {
      syncingRef.current = false;
    }
  }, []);

  const refreshIfStale = useCallback(
    (minGapMs = CALENDAR_FOCUS_DEBOUNCE_MS) => {
      if (Date.now() - lastSyncAttemptRef.current < minGapMs) return;
      void refresh();
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const intervalMs = onCalendarPage ? pollFastIntervalMs : pollIntervalMs;
    const interval = setInterval(
      () => void refresh({ silent: true }),
      intervalMs
    );
    return () => clearInterval(interval);
  }, [refresh, onCalendarPage, pollIntervalMs, pollFastIntervalMs]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshIfStale();
    };

    const onFocus = () => refreshIfStale();
    const onOnline = () => void refresh();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [refresh, refreshIfStale]);

  return (
    <CalendarEventsContext.Provider
      value={{ events, sources, syncStatus, lastSyncedAt, refresh }}
    >
      {children}
    </CalendarEventsContext.Provider>
  );
}

export function useCalendarEventsContext(): CalendarEventsContextValue {
  const ctx = useContext(CalendarEventsContext);
  if (!ctx) {
    throw new Error(
      "useCalendarEvents must be used within CalendarEventsProvider"
    );
  }
  return ctx;
}
