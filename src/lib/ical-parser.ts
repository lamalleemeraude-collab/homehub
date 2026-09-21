import ical, { expandRecurringEvent } from "node-ical";
import type { VEvent } from "node-ical";
import type { IcloudApiEvent } from "./hub-events";

export function toHttpsUrl(url: string): string {
  return url.replace(/^webcal:\/\//i, "https://");
}

function toIsoString(
  value: Date | { toISOString?: () => string } | undefined
): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof (value as Date).toISOString === "function") {
    return (value as Date).toISOString();
  }
  return null;
}

function summaryText(summary: VEvent["summary"]): string {
  if (!summary) return "Sans titre";
  if (typeof summary === "string") return summary.trim();
  if (typeof summary === "object" && "val" in summary) {
    return String(summary.val ?? "Sans titre").trim();
  }
  return String(summary).trim();
}

function getExpansionRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 12, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 24, 0, 23, 59, 59, 999);
  return { from, to };
}

function isCancelled(vevent: VEvent): boolean {
  const status = vevent.status;
  if (!status) return false;
  const value = typeof status === "string" ? status : String(status);
  return value.toUpperCase() === "CANCELLED";
}

function isFullDayInstance(instance: {
  isFullDay?: boolean;
  start?: Date | { toISOString?: () => string };
}): boolean {
  if (instance.isFullDay) return true;
  return false;
}

function expandVEventInstances(
  vevent: VEvent,
  from: Date,
  to: Date
): Array<{
  start?: Date | { toISOString?: () => string };
  end?: Date | { toISOString?: () => string };
  summary?: VEvent["summary"];
  isFullDay?: boolean;
}> {
  let instances: Array<{
    start?: Date | { toISOString?: () => string };
    end?: Date | { toISOString?: () => string };
    summary?: VEvent["summary"];
    isFullDay?: boolean;
  }> = expandRecurringEvent(vevent, { from, to });

  if (instances.length === 0 && vevent.start instanceof Date) {
    const start = vevent.start;
    if (start >= from && start <= to) {
      instances = [
        {
          start: vevent.start,
          end: vevent.end ?? vevent.start,
          summary: vevent.summary,
          isFullDay: vevent.datetype === "date",
        },
      ];
    }
  }

  return instances;
}

export async function fetchIcalEvents(rawUrl: string): Promise<IcloudApiEvent[]> {
  const url = toHttpsUrl(rawUrl);
  const data = await ical.async.fromURL(url);
  const { from, to } = getExpansionRange();

  const events: IcloudApiEvent[] = [];
  const seen = new Set<string>();

  for (const item of Object.values(data)) {
    if (!item || typeof item !== "object") continue;
    if (item.type !== "VEVENT") continue;

    const vevent = item as VEvent;
    if (isCancelled(vevent)) continue;

    const instances = expandVEventInstances(vevent, from, to);

    for (const instance of instances) {
      const start = toIsoString(instance.start);
      const end = toIsoString(instance.end ?? instance.start);
      if (!start || !end) continue;

      const uid = vevent.uid ?? `${start}-${summaryText(vevent.summary)}`;
      const id = `${uid}-${start}`;
      if (seen.has(id)) continue;
      seen.add(id);

      events.push({
        id,
        title: summaryText(instance.summary ?? vevent.summary),
        start,
        end,
        allDay: isFullDayInstance(instance),
      });
    }
  }

  return events.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}
