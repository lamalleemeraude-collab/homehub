"use client";

import { useWebhookCalendarEvents } from "@/contexts/WebhookCalendarContext";

/** @deprecated Utiliser useWebhookCalendarEvents() */
export function useIphoneSyncEvents() {
  const webhook = useWebhookCalendarEvents();
  return {
    events: webhook.events,
    syncedAt: webhook.syncedAt,
    loading: false,
    refresh: webhook.refresh,
  };
}
