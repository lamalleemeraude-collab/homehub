import {
  eventDateKey,
  formatEventSchedule,
  isAllDayEvent,
  type HubEvent,
} from "@/lib/hub-events";
import type { IPhoneSyncEvent } from "./types";

/** Événements reçus via le Raccourci iOS → webhook-calendar */
export function webhookCalendarToHubEvents(
  events: IPhoneSyncEvent[]
): HubEvent[] {
  return events.map((event) => {
    const allDay = isAllDayEvent(event.start, event.end, event.allDay);
    const date = eventDateKey(event.start, allDay);
    const schedule = formatEventSchedule({
      start: event.start,
      end: event.end,
      allDay,
    });

    return {
      id: event.id,
      date,
      title: event.title,
      type: "papa",
      fromWebhook: true,
      sourceCalendar: event.calendar,
      details: `${event.calendar} — ${schedule}`,
      start: event.start,
      end: event.end,
      allDay,
    };
  });
}

/** @deprecated */
export const iphoneSyncToHubEvents = webhookCalendarToHubEvents;
