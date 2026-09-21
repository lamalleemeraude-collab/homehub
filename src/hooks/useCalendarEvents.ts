"use client";

import { useEffect, useMemo, useState } from "react";
import { useCalendarEventsContext } from "@/contexts/CalendarEventsContext";
import { getBuiltinEvents } from "@/lib/builtin-events";
import { mergeHubEvents } from "@/lib/hub-events";

export type { CalendarSourceStatus, CalendarSyncStatus } from "@/contexts/CalendarEventsContext";

export function useCalendarEvents() {
  const ctx = useCalendarEventsContext();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const events = useMemo(
    () => mergeHubEvents(ctx.events, getBuiltinEvents(new Date())),
    [ctx.events, tick]
  );

  return { ...ctx, events };
}
