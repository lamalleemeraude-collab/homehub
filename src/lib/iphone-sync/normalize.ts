import type {
  IPhoneSyncEvent,
  IPhoneSyncIncomingEvent,
  IPhoneSyncPostBody,
} from "./types";

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function eventId(title: string, start: string, calendar: string): string {
  return `webhook-${slug(calendar)}-${slug(start)}-${slug(title)}`.slice(0, 120);
}

export function normalizeIncomingEvent(
  raw: IPhoneSyncIncomingEvent,
  index: number
): IPhoneSyncEvent | null {
  const title = (raw.titre ?? raw.title ?? "").trim();
  const start = (raw.dateDebut ?? raw.start ?? "").trim();
  const end = (raw.dateFin ?? raw.end ?? start).trim();
  const calendar = (raw.calendrier ?? raw.calendar ?? "iPhone").trim();
  const allDay = Boolean(
    raw.allDay ?? raw.journéeEntière ?? raw.journeeEntiere
  );

  if (!title || !start) return null;

  return {
    id: eventId(title, start, calendar) || `webhook-event-${index}`,
    title,
    start,
    end: end || start,
    calendar,
    allDay,
  };
}

export function parsePostBody(body: unknown): IPhoneSyncIncomingEvent[] {
  if (Array.isArray(body)) return body as IPhoneSyncIncomingEvent[];

  if (body && typeof body === "object" && "events" in body) {
    const events = (body as IPhoneSyncPostBody).events;
    return Array.isArray(events) ? events : [];
  }

  return [];
}

export function normalizeIncomingEvents(
  rawEvents: IPhoneSyncIncomingEvent[]
): IPhoneSyncEvent[] {
  const normalized: IPhoneSyncEvent[] = [];
  const seen = new Set<string>();

  rawEvents.forEach((raw, index) => {
    const event = normalizeIncomingEvent(raw, index);
    if (!event || seen.has(event.id)) return;
    seen.add(event.id);
    normalized.push(event);
  });

  return normalized.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}
