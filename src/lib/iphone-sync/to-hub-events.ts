import {
  eventDateKey,
  formatEventSchedule,
  isAllDayEvent,
  type HubEvent,
  type HubEventType,
} from "@/lib/hub-events";
import type { IPhoneSyncEvent } from "./types";

function hubTypeFromCalendar(calendar: string): HubEventType {
  const name = calendar.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (name.includes("maelle") || name.includes("college")) return "maelle";
  if (name.includes("roulle") || name.includes("philippe")) return "roulle";
  return "papa";
}

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
      type: hubTypeFromCalendar(event.calendar),
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
