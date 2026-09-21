"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { CalendarRefreshButton } from "@/components/calendar/CalendarRefreshButton";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useWebhookCalendarEvents } from "@/contexts/WebhookCalendarContext";
import {
  getEventBlockStyle,
  getEventTypeStyle,
  mergeHubEvents,
} from "@/lib/hub-events";
import {
  formatEventTime,
  formatUpcomingEventTitle,
  getUpcomingEventsByDay,
} from "@/lib/event-reminders";

export function EventRemindersWidget() {
  const { events: hubEvents, syncStatus, refresh } = useCalendarEvents();
  const webhook = useWebhookCalendarEvents();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const calendarEvents = useMemo(
    () => mergeHubEvents(hubEvents, webhook.events),
    [hubEvents, webhook.events]
  );

  const dayGroups = useMemo(
    () => getUpcomingEventsByDay(calendarEvents, now),
    [calendarEvents, now]
  );

  if (dayGroups.length === 0) return null;

  async function handleRefresh() {
    await Promise.all([refresh({ force: true }), webhook.refresh()]);
  }

  return (
    <BentoCard className="shrink-0 px-4 py-3 sm:px-5 sm:py-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={2.5} />
          <div>
            <h2 className="text-sm font-bold text-slate-800 sm:text-base">
              À ne pas oublier
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Demain et les 3 jours suivants
            </p>
          </div>
        </div>
        <CalendarRefreshButton
          status={syncStatus}
          onRefresh={() => void handleRefresh()}
        />
      </div>

      <div className="kiosk-scroll max-h-[min(22rem,40vh)] space-y-4 overflow-y-auto pr-1">
        {dayGroups.map((group) => (
          <section key={group.title + group.dayOffset}>
            <h3
              className={`mb-1.5 text-xs font-semibold uppercase tracking-wide ${
                group.dayOffset === 0
                  ? "text-rose-400/90"
                  : group.dayOffset === 1
                    ? "text-sky-500/90"
                    : "text-slate-400"
              }`}
            >
              {group.title}
              <span className="ml-2 font-medium normal-case text-slate-400">
                {group.items.length} rdv
              </span>
            </h3>

            <ul className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white/70 shadow-sm shadow-slate-200/15 backdrop-blur-sm">
              {group.items.map((item, index) => {
                const { event } = item;
                const typeStyle = getEventTypeStyle(event.type, event);
                const time = formatEventTime(event);
                const isLast = index === group.items.length - 1;

                return (
                  <li
                    key={`${event.id}-${index}`}
                    className={`flex items-stretch gap-0 ${
                      !isLast ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <div
                      className={`w-1 shrink-0 ${getEventBlockStyle(event.type, event)}`}
                    />
                    <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:py-3">
                      {time && (
                        <span className="w-12 shrink-0 text-sm font-bold tabular-nums text-slate-600">
                          {time}
                        </span>
                      )}
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 sm:text-base">
                        {formatUpcomingEventTitle(item)}
                      </p>
                      <span
                        className={`hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase sm:inline ${typeStyle.pill}`}
                      >
                        {typeStyle.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </BentoCard>
  );
}
