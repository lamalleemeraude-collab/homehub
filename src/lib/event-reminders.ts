import {
  addDays,
  differenceInCalendarDays,
  format,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  formatEventSchedule,
  isAllDayEvent,
  sortEventsChronologically,
  type HubEvent,
} from "./hub-events";

/** Demain + 3 jours suivants (J+1 → J+4). */
export const UPCOMING_FUTURE_DAY_MAX = 4;

/** Nombre de jours affichés sur l'accueil (aujourd'hui inclus). */
export const HOME_AGENDA_DAY_COUNT = 8;

export type UpcomingEventItem = {
  event: HubEvent;
};

export type UpcomingDayGroup = {
  dayOffset: number;
  date: Date;
  title: string;
  items: UpcomingEventItem[];
};

function formatDayTitle(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return "Demain";
  const label = format(date, "EEEE d MMMM", { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatEventTime(event: HubEvent): string {
  if (isAllDayEvent(event.start, event.end, event.allDay)) {
    return "Journée";
  }
  if (!event.start) return "";
  return format(parseISO(event.start), "HH:mm");
}

function isEventStillUpcoming(event: HubEvent, referenceDate: Date): boolean {
  if (isAllDayEvent(event.start, event.end, event.allDay)) return true;
  if (!event.start) return true;
  return parseISO(event.start) >= referenceDate;
}

/** Événements groupés : demain → J+4. */
export function getUpcomingEventsByDay(
  events: HubEvent[],
  referenceDate: Date = new Date()
): UpcomingDayGroup[] {
  const refDay = startOfDay(referenceDate);
  const groups: UpcomingDayGroup[] = [];

  for (let offset = 1; offset <= UPCOMING_FUTURE_DAY_MAX; offset++) {
    const date = addDays(refDay, offset);
    const dateKey = format(date, "yyyy-MM-dd");

    const calendarEvents = sortEventsChronologically(
      events.filter(
        (event) =>
          event.date === dateKey &&
          event.type !== "reminder" &&
          isEventStillUpcoming(event, referenceDate)
      )
    );

    if (calendarEvents.length === 0) continue;

    groups.push({
      dayOffset: offset,
      date,
      title: formatDayTitle(date),
      items: calendarEvents.map((event) => ({ event })),
    });
  }

  return groups;
}

/** 8 prochains jours calendaires (aujourd'hui → J+7), avec ou sans événements. */
export function getNextCalendarDaySlots(
  events: HubEvent[],
  referenceDate: Date = new Date(),
  dayCount = HOME_AGENDA_DAY_COUNT
): UpcomingDayGroup[] {
  const refDay = startOfDay(referenceDate);
  const groups: UpcomingDayGroup[] = [];

  for (let offset = 0; offset < dayCount; offset++) {
    const date = addDays(refDay, offset);
    const dateKey = format(date, "yyyy-MM-dd");

    const calendarEvents = sortEventsChronologically(
      events.filter(
        (event) =>
          event.date === dateKey &&
          event.type !== "reminder" &&
          isEventStillUpcoming(event, referenceDate)
      )
    );

    groups.push({
      dayOffset: offset,
      date,
      title: formatDayTitle(date),
      items: calendarEvents.map((event) => ({ event })),
    });
  }

  return groups;
}

export function formatUpcomingEventTitle(item: UpcomingEventItem): string {
  return item.event.title;
}

export { formatEventTime, formatEventSchedule, differenceInCalendarDays };
