export type HubEventType =
  | "maelle"
  | "papa"
  | "roulle"
  | "reminder";

export type HubEvent = {
  id: string;
  date: string;
  title: string;
  type: HubEventType;
  details: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  /** Événement poussé par le Raccourci iOS (webhook-calendar). */
  fromWebhook?: boolean;
  /** Nom du calendrier d'origine sur l'iPhone. */
  sourceCalendar?: string;
};

export type IcloudApiEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
};

export const EVENT_TYPE_STYLES: Record<
  HubEventType,
  { pill: string; block: string; label: string; dot: string; accent: string }
> = {
  maelle: {
    block: "bg-sky-50/90 text-sky-900 ring-1 ring-inset ring-sky-200/50",
    pill: "bg-sky-50/90 text-sky-800 border border-sky-100",
    label: "MAELLE",
    dot: "bg-sky-400",
    accent: "border-l-sky-400",
  },
  papa: {
    block: "bg-rose-50/90 text-rose-900 ring-1 ring-inset ring-rose-200/50",
    pill: "bg-rose-50/90 text-rose-800 border border-rose-100",
    label: "FRANÇOIS",
    dot: "bg-rose-400",
    accent: "border-l-rose-400",
  },
  roulle: {
    block: "bg-amber-50/90 text-amber-950 ring-1 ring-inset ring-amber-200/60",
    pill: "bg-amber-50/90 text-amber-900 border border-amber-200/60",
    label: "PHILIPPE ROULLÉ",
    dot: "bg-[#d4a853]",
    accent: "border-l-[#d4a853]",
  },
  reminder: {
    block: "bg-violet-50/90 text-violet-900 ring-1 ring-inset ring-violet-200/50",
    pill: "bg-violet-50/90 text-violet-800 border border-violet-100",
    label: "Rappel",
    dot: "bg-violet-400",
    accent: "border-l-violet-400",
  },
};

const TYPE_LABELS: Record<HubEventType, string> = {
  maelle: "MAELLE",
  papa: "FRANÇOIS",
  roulle: "PHILIPPE ROULLÉ",
  reminder: "Rappel Hub",
};

const TIME_FMT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

/** Détecte un événement sans horaire (DATE iCal ou minuit → minuit). */
export function isAllDayEvent(
  start?: string,
  end?: string,
  allDay?: boolean
): boolean {
  if (allDay) return true;
  if (!start) return true;

  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) return true;

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;

  const isMidnight = (d: Date) =>
    d.getHours() === 0 && d.getMinutes() === 0;

  if (isMidnight(startDate) && isMidnight(endDate)) return true;

  return false;
}

export function formatEventSchedule(
  event: Pick<HubEvent, "start" | "end" | "allDay">
): string {
  if (isAllDayEvent(event.start, event.end, event.allDay)) {
    return "Journée entière";
  }

  if (!event.start || !event.end) return "Journée entière";

  const start = new Date(event.start).toLocaleTimeString("fr-FR", TIME_FMT);
  const end = new Date(event.end).toLocaleTimeString("fr-FR", TIME_FMT);
  return `${start} – ${end}`;
}

export function icalToHubEvents(
  events: IcloudApiEvent[],
  type: HubEventType,
  idPrefix: string
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
      id: `${idPrefix}-${event.id}`,
      date,
      title: event.title,
      type,
      details: `${TYPE_LABELS[type]} — ${schedule}`,
      start: event.start,
      end: event.end,
      allDay,
    };
  });
}

export const WEBHOOK_PAPA_STYLE = {
  block: "bg-sky-50/90 text-sky-900 ring-1 ring-inset ring-sky-200/50",
  pill: "bg-sky-50/90 text-sky-800 border border-sky-100",
  label: "iPhone",
  dot: "bg-sky-400",
  accent: "border-l-sky-400",
} as const;

export function getEventTypeStyle(
  type: HubEventType,
  event?: Pick<HubEvent, "fromWebhook">
) {
  if (event?.fromWebhook && type === "papa") {
    return WEBHOOK_PAPA_STYLE;
  }
  return EVENT_TYPE_STYLES[type] ?? EVENT_TYPE_STYLES.reminder;
}

/** Bordure accent (vue mois compacte). */
export function getEventAccentStyle(
  type: HubEventType,
  event?: Pick<HubEvent, "fromWebhook">
) {
  return getEventTypeStyle(type, event).accent;
}

/** Pastille pleine type iCal (vue mois). */
export function getEventBlockStyle(
  type: HubEventType,
  event?: Pick<HubEvent, "fromWebhook">
) {
  return getEventTypeStyle(type, event).block;
}

export function mergeHubEvents(...groups: HubEvent[][]): HubEvent[] {
  return groups.flat().sort((a, b) => a.date.localeCompare(b.date));
}

export function sortEventsChronologically(events: HubEvent[]): HubEvent[] {
  return [...events].sort((a, b) => {
    const aTime = a.start ? new Date(a.start).getTime() : 0;
    const bTime = b.start ? new Date(b.start).getTime() : 0;
    if (aTime !== bTime) return aTime - bTime;
    return a.title.localeCompare(b.title, "fr");
  });
}

export function groupEventsByDate(
  events: HubEvent[]
): Map<string, HubEvent[]> {
  const map = new Map<string, HubEvent[]>();
  for (const event of events) {
    const existing = map.get(event.date) ?? [];
    map.set(event.date, [...existing, event]);
  }
  for (const [key, dayEvents] of map) {
    map.set(key, sortEventsChronologically(dayEvents));
  }
  return map;
}

const PARIS_DATE_FMT = new Intl.DateTimeFormat("fr-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Date d'affichage calendrier — fuseau Europe/Paris (aligné iPhone / iCal). */
export function eventDateKey(start: string, _allDay?: boolean): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) return start;

  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return start.slice(0, 10);

  return PARIS_DATE_FMT.format(date);
}
