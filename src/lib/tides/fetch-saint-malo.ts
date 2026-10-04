import { parseMareeInfoHtml } from "./parse-maree-info";
import type { TideScheduleRaw, TideSnapshot } from "./types";
import { SAINT_MALO_FALLBACK_SCHEDULE } from "./saint-malo-fallback";

export const SAINT_MALO_PORT_ID = 52;
export const SAINT_MALO_SOURCE_URL = `https://maree.info/${SAINT_MALO_PORT_ID}`;

let memoryCache: { at: number; snapshot: TideSnapshot } | null = null;
const CACHE_MS = 60 * 60 * 1000; // 1 h

export async function fetchSaintMaloTides(): Promise<TideSnapshot> {
  if (memoryCache && Date.now() - memoryCache.at < CACHE_MS) {
    return memoryCache.snapshot;
  }

  try {
    const res = await fetch(SAINT_MALO_SOURCE_URL, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent":
          "Mozilla/5.0 (compatible; HomeHub/1.0; +https://homehub.local)",
        "accept-language": "fr-FR,fr;q=0.9",
      },
      next: { revalidate: 3600 },
      cache: "force-cache",
    });
    if (!res.ok) throw new Error(`maree.info HTTP ${res.status}`);
    const html = await res.text();
    const events = parseMareeInfoHtml(html);
    if (events.length < 4) throw new Error("Trop peu d’horaires parsés");

    const snapshot: TideSnapshot = {
      ok: true,
      port: "Saint-Malo",
      source: "maree.info",
      sourceUrl: SAINT_MALO_SOURCE_URL,
      syncedAt: new Date().toISOString(),
      events,
    };
    memoryCache = { at: Date.now(), snapshot };
    return snapshot;
  } catch (error) {
    console.error("[tides/saint-malo]", error);
    const fallback: TideSnapshot = {
      ok: true,
      port: "Saint-Malo",
      source: "fallback",
      sourceUrl: SAINT_MALO_SOURCE_URL,
      syncedAt: new Date().toISOString(),
      events: SAINT_MALO_FALLBACK_SCHEDULE,
    };
    return fallback;
  }
}

export function rawEventsToSchedule(
  events: TideScheduleRaw[]
): TideScheduleRaw[] {
  return [...events].sort((a, b) => a.iso.localeCompare(b.iso));
}
