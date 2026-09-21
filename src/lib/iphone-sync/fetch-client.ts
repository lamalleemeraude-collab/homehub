import { webhookCalendarToHubEvents } from "./to-hub-events";
import type { IPhoneSyncEvent } from "./types";
import type { HubEvent } from "@/lib/hub-events";

type WebhookCalendarResponse = {
  syncedAt: string | null;
  events: IPhoneSyncEvent[];
};

export async function fetchWebhookCalendarHubEvents(): Promise<{
  events: HubEvent[];
  syncedAt: string | null;
}> {
  try {
    const res = await fetch(`/api/webhook-calendar?_=${Date.now()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { events: [], syncedAt: null };
    }

    const data = (await res.json()) as WebhookCalendarResponse;
    return {
      events: webhookCalendarToHubEvents(data.events ?? []),
      syncedAt: data.syncedAt,
    };
  } catch {
    return { events: [], syncedAt: null };
  }
}

/** @deprecated */
export const fetchIphoneSyncHubEvents = fetchWebhookCalendarHubEvents;
