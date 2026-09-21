"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, isToday, isTomorrow, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { CalendarRefreshButton } from "@/components/calendar/CalendarRefreshButton";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useWebhookCalendarEvents } from "@/contexts/WebhookCalendarContext";
import {
  formatEventTime,
  formatUpcomingEventTitle,
} from "@/lib/event-reminders";
import {
  formatEventSchedule,
  getEventTypeStyle,
  mergeHubEvents,
  sortEventsChronologically,
  type HubEvent,
} from "@/lib/hub-events";

const AGENDA_DAY_SPAN = 14;

type AgendaDay = {
  date: Date;
  title: string;
  isToday: boolean;
  events: HubEvent[];
};

function formatAgendaDayTitle(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return "Demain";
  const label = format(date, "EEEE d MMMM", { locale: fr });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function groupAgendaByDay(events: HubEvent[], reference: Date): AgendaDay[] {
  const refDay = startOfDay(reference);
  const days: AgendaDay[] = [];

  for (let offset = 0; offset < AGENDA_DAY_SPAN; offset++) {
    const date = addDays(refDay, offset);
    const dateKey = format(date, "yyyy-MM-dd");
    const dayEvents = sortEventsChronologically(
      events.filter((e) => e.date === dateKey && e.type !== "reminder")
    );
    if (dayEvents.length === 0) continue;

    days.push({
      date,
      title: formatAgendaDayTitle(date),
      isToday: offset === 0,
      events: dayEvents,
    });
  }

  return days;
}

export function AgendaTimeline() {
  const { events: hubEvents, syncStatus, refresh } = useCalendarEvents();
  const webhook = useWebhookCalendarEvents();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const days = useMemo(() => {
    const merged = mergeHubEvents(hubEvents, webhook.events);
    return groupAgendaByDay(merged, now);
  }, [hubEvents, webhook.events, now]);

  async function handleRefresh() {
    await Promise.all([refresh({ force: true }), webhook.refresh()]);
  }

  if (days.length === 0) {
    return (
      <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 p-8 text-center">
        <CalendarDays className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
        <div>
          <p className="text-lg font-bold text-slate-600">Rien à l&apos;horizon</p>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Les 14 prochains jours sont libres
          </p>
        </div>
        <CalendarRefreshButton
          status={syncStatus}
          onRefresh={() => void handleRefresh()}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/40 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {(["maelle", "papa", "roulle"] as const).map((type) => {
            const style = getEventTypeStyle(type);
            return (
              <span
                key={type}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${style.pill}`}
              >
                <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                {style.label}
              </span>
            );
          })}
        </div>
        <CalendarRefreshButton
          status={syncStatus}
          onRefresh={() => void handleRefresh()}
        />
      </div>

      <div className="agenda-timeline kiosk-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        {days.map((day) => (
          <section key={day.date.toISOString()} className="agenda-day-group mb-6 last:mb-2">
            <div
              className={`agenda-day-header sticky top-0 z-20 mb-3 flex items-center gap-3 rounded-2xl border px-3 py-2 backdrop-blur-md ${
                day.isToday
                  ? "border-sky-200/60 bg-sky-50/90 shadow-sm"
                  : "border-white/50 bg-white/70"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${
                  day.isToday ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                <span className="text-[10px] font-bold uppercase leading-none">
                  {format(day.date, "EEE", { locale: fr })}
                </span>
                <span className="text-xl font-black leading-tight tabular-nums">
                  {format(day.date, "d")}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{day.title}</p>
                <p className="text-xs font-medium text-slate-500">
                  {day.events.length} événement{day.events.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <ol className="relative space-y-0 pl-2 sm:pl-4">
              <div
                className="absolute bottom-2 left-[1.65rem] top-2 w-0.5 bg-gradient-to-b from-sky-200 via-violet-200 to-rose-200 sm:left-[1.85rem]"
                aria-hidden
              />

              {day.events.map((event, index) => {
                const style = getEventTypeStyle(event.type, event);
                const time = formatEventTime(event);
                const schedule = formatEventSchedule(event);

                return (
                  <li
                    key={`${event.id}-${index}`}
                    className="agenda-event-row relative flex gap-3 pb-4 last:pb-0 sm:gap-4"
                  >
                    <div className="relative z-10 flex w-14 shrink-0 flex-col items-end pt-3 sm:w-16">
                      <span className="text-sm font-black tabular-nums text-slate-800 sm:text-base">
                        {time === "Journée" ? "∞" : time}
                      </span>
                    </div>

                    <div className="relative z-10 flex shrink-0 flex-col items-center pt-3">
                      <span
                        className={`h-3.5 w-3.5 rounded-full ring-4 ring-white/80 ${style.dot}`}
                      />
                    </div>

                    <article
                      className={`agenda-event-card min-w-0 flex-1 rounded-2xl border border-white/60 bg-white/75 p-3 shadow-sm backdrop-blur-sm sm:p-4 ${style.accent} border-l-4`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
                          {formatUpcomingEventTitle({ event })}
                        </h3>
                        <span
                          className={`shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase ${style.pill}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{schedule}</p>
                      {event.details && (
                        <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                          {event.details}
                        </p>
                      )}
                      {event.sourceCalendar && (
                        <p className="mt-2 text-[10px] font-medium text-slate-400">
                          {event.sourceCalendar}
                        </p>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
