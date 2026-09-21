import type { IcloudApiEvent } from "@/lib/hub-events";
import { fetchIcalEvents, toHttpsUrl } from "@/lib/ical-parser";

/** Évite le cache CDN/iCloud en ajoutant un paramètre volatile à chaque fetch frais. */
export function icalFetchUrl(rawUrl: string): string {
  const https = toHttpsUrl(rawUrl);
  const separator = https.includes("?") ? "&" : "?";
  return `${https}${separator}_hub=${Date.now()}`;
}

export async function fetchIcalProviderEvents(
  rawUrl: string
): Promise<IcloudApiEvent[]> {
  return fetchIcalEvents(icalFetchUrl(rawUrl));
}
