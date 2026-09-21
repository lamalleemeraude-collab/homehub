import type {
  CalendarFetchResult,
  CalendarId,
  CalendarProvider,
} from "./types";
import { fetchGoogleCalendarEvents } from "./providers/google";
import { fetchIcalProviderEvents } from "./providers/ical";
import {
  CALENDAR_SOURCES,
  getCalendarSource,
  resolveSourceProvider,
  resolveSourceUrl,
  type CalendarSourceDefinition,
  type CalendarSourceId,
} from "./sources";

export type CalendarSyncResult = {
  sourceId: CalendarSourceId;
  label: string;
  account: CalendarSourceDefinition["account"];
  iphoneName: string;
  configured: boolean;
  result: CalendarFetchResult | null;
  error?: string;
};

async function fetchFromSource(
  source: CalendarSourceDefinition,
  icalUrl: string,
  provider: CalendarProvider
) {
  if (provider === "google") {
    const calendarId = process.env[`GOOGLE_CALENDAR_${source.id.toUpperCase()}_ID`];
    if (!calendarId) {
      throw new Error(
        `[calendar/${source.id}] GOOGLE_CALENDAR_${source.id.toUpperCase()}_ID requis`
      );
    }
    return fetchGoogleCalendarEvents(calendarId);
  }

  return fetchIcalProviderEvents(icalUrl);
}

export async function getCalendarSourceEvents(
  sourceId: CalendarSourceId
): Promise<CalendarSyncResult> {
  const source = getCalendarSource(sourceId);
  const icalUrl = resolveSourceUrl(source);

  if (!icalUrl) {
    return {
      sourceId,
      label: source.label,
      account: source.account,
      iphoneName: source.iphoneName,
      configured: false,
      result: null,
    };
  }

  try {
    const provider = resolveSourceProvider(source);
    const events = await fetchFromSource(source, icalUrl, provider);
    return {
      sourceId,
      label: source.label,
      account: source.account,
      iphoneName: source.iphoneName,
      configured: true,
      result: {
        events,
        syncedAt: new Date(),
        source: provider,
        fromCache: false,
      },
    };
  } catch (error) {
    return {
      sourceId,
      label: source.label,
      account: source.account,
      iphoneName: source.iphoneName,
      configured: true,
      result: null,
      error: error instanceof Error ? error.message : "Erreur de synchronisation",
    };
  }
}

/** Synchronise tous les agendas configurés (URL iCal publique). */
export async function getAllCalendarEvents(): Promise<CalendarSyncResult[]> {
  return Promise.all(CALENDAR_SOURCES.map((source) => getCalendarSourceEvents(source.id)));
}

/** Compat — routes /api/calendar/maelle|papa */
export async function getCalendarEvents(
  id: CalendarId
): Promise<CalendarFetchResult> {
  const sync = await getCalendarSourceEvents(id);
  if (!sync.result) {
    throw new Error(sync.error ?? `[calendar/${id}] non configuré ou indisponible`);
  }
  return sync.result;
}
