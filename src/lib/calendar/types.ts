import type { IcloudApiEvent } from "@/lib/hub-events";

export type CalendarProvider = "ical" | "google";

export type CalendarId = "maelle" | "papa" | "roulle";

export type CalendarConfig = {
  id: CalendarId;
  provider: CalendarProvider;
  icalUrl?: string;
  googleCalendarId?: string;
};

export type CalendarFetchResult = {
  events: IcloudApiEvent[];
  syncedAt: Date;
  source: CalendarProvider;
  fromCache: boolean;
};

export type CalendarApiPayload = {
  events: IcloudApiEvent[];
  syncedAt: string;
  source: CalendarProvider;
  fromCache: boolean;
};

export const CALENDAR_POLL_INTERVAL_MS = 60_000;

/** Intervalle plus court sur la page calendrier */
export const CALENDAR_POLL_FAST_MS = 30_000;

/** Délai minimum entre deux syncs déclenchées par focus / visibilité */
export const CALENDAR_FOCUS_DEBOUNCE_MS = 8_000;

export function toCalendarApiPayload(result: CalendarFetchResult): CalendarApiPayload {
  return {
    events: result.events,
    syncedAt: result.syncedAt.toISOString(),
    source: result.source,
    fromCache: result.fromCache,
  };
}
