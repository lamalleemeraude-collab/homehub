"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { TouchButton } from "@/components/ui/TouchButton";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useWebhookCalendarEvents } from "@/contexts/WebhookCalendarContext";
import { CalendarRefreshButton } from "@/components/calendar/CalendarRefreshButton";
import { CalendarSyncIndicator } from "@/components/calendar/CalendarSyncIndicator";
import {
  formatEventSchedule,
  getEventAccentStyle,
  getEventBlockStyle,
  getEventTypeStyle,
  groupEventsByDate,
  isAllDayEvent,
  mergeHubEvents,
  type HubEvent,
  type HubEventType,
} from "@/lib/hub-events";

const WEEKDAYS_SHORT = ["L", "M", "M", "J", "V", "S", "D"];
const WEEKDAYS_FULL = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MAX_VISIBLE_EVENTS_MOBILE = 2;
const MAX_VISIBLE_EVENTS_DESKTOP = 4;

const LEGEND: { type: HubEventType; label: string }[] = [
  { type: "maelle", label: "Maelle" },
  { type: "papa", label: "François" },
  { type: "roulle", label: "Roullé" },
];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: Date[] = [];

  for (let i = startOffset; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  while (days.length < 35) {
    const last = days[days.length - 1];
    days.push(
      new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
    );
  }

  while (days.length > 35) {
    const lastWeek = days.slice(-7);
    if (lastWeek.every((d) => d.getMonth() !== month)) {
      days.splice(-7, 7);
    } else {
      break;
    }
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    days.push(
      new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
    );
  }

  return days;
}

function formatMonthYear(date: Date): string {
  const formatted = date.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatDayLong(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function eventTimeLabel(event: HubEvent): string | null {
  if (isAllDayEvent(event.start, event.end, event.allDay)) return null;
  if (!event.start) return null;
  return new Date(event.start).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MonthEventChip({
  event,
  onSelect,
  compact,
}: {
  event: HubEvent;
  onSelect: (event: HubEvent) => void;
  compact?: boolean;
}) {
  const style = getEventTypeStyle(event.type, event);
  const time = eventTimeLabel(event);

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(event);
        }}
        className={`cal-event-dot flex w-full min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 ${getEventBlockStyle(event.type, event)}`}
        title={event.title}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
        <span className="min-w-0 truncate text-[11px] font-bold leading-tight">
          {time ? `${time} ` : ""}
          {event.title}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(event);
      }}
      className={`cal-event-chip group flex w-full min-w-0 flex-col gap-0.5 rounded-lg px-1.5 py-1 text-left shadow-sm ring-1 ring-black/[0.04] ${getEventBlockStyle(event.type, event)}`}
      title={event.title}
    >
      {time && (
        <span className="text-[10px] font-bold tabular-nums opacity-75 sm:text-[11px]">
          {time}
        </span>
      )}
      <span className="line-clamp-2 text-[11px] font-bold leading-snug sm:text-xs">
        {event.title}
      </span>
    </button>
  );
}

function EventDetailModal({
  event,
  onClose,
}: {
  event: HubEvent;
  onClose: () => void;
}) {
  const style = getEventTypeStyle(event.type, event);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/25 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl border border-white/60 bg-white/95 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`border-b border-white/50 px-5 py-4 ${getEventBlockStyle(event.type, event)}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.pill}`}
              >
                <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                {style.label}
              </span>
              <h2 className="mt-2 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                {event.title}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/80 active:bg-white"
            >
              <X className="h-5 w-5 text-slate-500" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="space-y-3 px-5 py-4">
          <p className="text-base font-semibold capitalize text-slate-600">
            {formatDayLong(new Date(event.date + "T12:00:00"))}
          </p>
          <p className="text-sm font-medium text-slate-500">
            {formatEventSchedule(event)}
          </p>
          {event.sourceCalendar && (
            <p className="text-sm font-medium text-slate-500">
              Calendrier : {event.sourceCalendar}
            </p>
          )}
          {event.details && (
            <p className="border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-700">
              {event.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DayDetailModal({
  date,
  events,
  onSelectEvent,
  onClose,
}: {
  date: Date;
  events: HubEvent[];
  onSelectEvent: (event: HubEvent) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/25 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full overflow-hidden rounded-t-3xl border border-white/60 bg-white/95 shadow-xl sm:max-w-lg sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100/80 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {events.length} événement{events.length !== 1 ? "s" : ""}
              </p>
              <h2 className="text-lg font-bold capitalize text-slate-900 sm:text-xl">
                {formatDayLong(date)}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white active:bg-slate-50"
            >
              <X className="h-5 w-5 text-slate-500" strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <ul className="cal-day-list kiosk-scroll max-h-[60vh] space-y-2 overflow-y-auto p-3 sm:p-4">
          {events.map((event) => {
            const style = getEventTypeStyle(event.type, event);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onSelectEvent(event)}
                  className={`flex w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-3 py-3 text-left shadow-sm active:scale-[0.99] ${getEventAccentStyle(event.type, event)} border-l-[3px]`}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {event.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {style.label} · {formatEventSchedule(event)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function useMinWidth(minWidth: number): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [minWidth]);

  return matches;
}

export function MonthlyCalendar() {
  const { events: hubEvents, syncStatus, lastSyncedAt, refresh } =
    useCalendarEvents();
  const webhook = useWebhookCalendarEvents();
  const isWide = useMinWidth(640);
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedEvent, setSelectedEvent] = useState<HubEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<{
    date: Date;
    events: HubEvent[];
  } | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const calendarDays = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );
  const weekCount = calendarDays.length / 7;

  const allEvents = useMemo(
    () => mergeHubEvents(hubEvents, webhook.events),
    [hubEvents, webhook.events]
  );

  const eventsByDate = useMemo(
    () => groupEventsByDate(allEvents),
    [allEvents]
  );

  async function handleRefresh() {
    await Promise.all([refresh({ force: true }), webhook.refresh()]);
  }

  function goToToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return (
    <>
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="cal-month-toolbar shrink-0 border-b border-white/40 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 items-center gap-0.5 rounded-2xl border border-white/60 bg-white/70 p-0.5 shadow-sm">
              <TouchButton
                ariaLabel="Mois précédent"
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 active:bg-white sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
              </TouchButton>
              <button
                type="button"
                onClick={goToToday}
                className="rounded-xl px-2.5 py-1.5 text-xs font-bold text-sky-700 active:bg-white sm:px-3"
              >
                Auj.
              </button>
              <TouchButton
                ariaLabel="Mois suivant"
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 active:bg-white sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
              </TouchButton>
            </div>

            <h2 className="min-w-0 flex-1 truncate text-center text-base font-black text-slate-800 sm:text-xl">
              {formatMonthYear(viewDate)}
            </h2>

            <div className="flex shrink-0 items-center gap-1">
              <CalendarRefreshButton
                status={syncStatus}
                onRefresh={() => void handleRefresh()}
              />
              <CalendarSyncIndicator status={syncStatus} lastSyncedAt={lastSyncedAt} />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {LEGEND.map(({ type, label }) => {
              const style = getEventTypeStyle(type);
              return (
                <span
                  key={type}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-xs ${style.pill}`}
                >
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-7 gap-1.5 border-b border-white/30 px-3 py-2 sm:gap-2 sm:px-4">
          {WEEKDAYS_FULL.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-black uppercase tracking-wide sm:text-sm ${
                i >= 5 ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
              <span className="hidden sm:inline">{day}</span>
            </div>
          ))}
        </div>

        <div className="cal-month-grid min-h-0 flex-1 overflow-hidden px-3 py-2 sm:px-4 sm:py-3">
          <div
            className="grid h-full min-h-0 grid-cols-7 gap-1.5 sm:gap-2"
            style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}
          >
            {calendarDays.map((day, i) => {
              const dateKey = toDateKey(day);
              const isCurrentMonth = day.getMonth() === month;
              const isToday = isSameDay(day, today);
              const isWeekend = i % 7 >= 5;
              const dayEvents = eventsByDate.get(dateKey) ?? [];
              const maxVisible = isWide
                ? MAX_VISIBLE_EVENTS_DESKTOP
                : MAX_VISIBLE_EVENTS_MOBILE;
              const visibleEvents = dayEvents.slice(0, maxVisible);
              const hiddenCount = dayEvents.length - visibleEvents.length;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={dateKey + i}
                  role={hasEvents ? "button" : undefined}
                  tabIndex={hasEvents ? 0 : undefined}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedDay({ date: day, events: dayEvents });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      hasEvents &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      setSelectedDay({ date: day, events: dayEvents });
                    }
                  }}
                  className={[
                    "cal-day-cell flex min-h-0 flex-col overflow-hidden rounded-xl p-1.5 text-left sm:rounded-2xl sm:p-2",
                    isToday && "cal-day-cell--today",
                    isWeekend && "cal-day-cell--weekend",
                    !isCurrentMonth && "cal-day-cell--muted",
                    hasEvents && "cursor-pointer active:scale-[0.99]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="mb-1 flex shrink-0 items-center justify-between gap-1">
                    <span
                      className={[
                        "flex h-7 min-w-[1.75rem] items-center justify-center text-sm font-black tabular-nums sm:h-8 sm:min-w-[2rem] sm:text-base",
                        isToday
                          ? "cal-day-number--today rounded-full"
                          : isCurrentMonth
                            ? "text-slate-800"
                            : "text-slate-400",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </span>
                    {hasEvents && (
                      <span className="rounded-full bg-slate-800/10 px-1.5 py-0.5 text-[10px] font-black tabular-nums text-slate-600 sm:text-xs">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                    {visibleEvents.map((event, eventIndex) => (
                      <MonthEventChip
                        key={event.id}
                        event={event}
                        onSelect={setSelectedEvent}
                        compact={!isWide && dayEvents.length >= 3 && eventIndex > 0}
                      />
                    ))}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDay({ date: day, events: dayEvents });
                        }}
                        className="mt-auto shrink-0 rounded-md bg-sky-500/15 px-1.5 py-1 text-left text-[10px] font-bold text-sky-800 active:bg-sky-500/25 sm:text-xs"
                      >
                        +{hiddenCount} autre{hiddenCount > 1 ? "s" : ""}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {selectedDay && !selectedEvent && (
        <DayDetailModal
          date={selectedDay.date}
          events={selectedDay.events}
          onSelectEvent={(event) => {
            setSelectedDay(null);
            setSelectedEvent(event);
          }}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}
