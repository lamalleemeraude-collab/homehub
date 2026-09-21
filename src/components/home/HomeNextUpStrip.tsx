"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { CalendarRefreshButton } from "@/components/calendar/CalendarRefreshButton";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useWebhookCalendarEvents } from "@/contexts/WebhookCalendarContext";
import {
  formatEventTime,
  formatUpcomingEventTitle,
  getNextCalendarDaySlots,
  getUpcomingEventsByDay,
  type UpcomingDayGroup,
} from "@/lib/event-reminders";
import { getEventTypeStyle, mergeHubEvents, type HubEvent } from "@/lib/hub-events";
import { PASTEL_GRADIENTS } from "@/lib/ui/pastel-theme";
import { homeTone, useHomeNight } from "./HomeNightContext";

type FlatEvent = {
  id: string;
  dayTitle: string;
  dayOffset: number;
  time: string;
  title: string;
  typeStyle: ReturnType<typeof getEventTypeStyle>;
};

function formatDayShortTitle(
  dayOffset: number,
  _title: string,
  date: Date
): string {
  if (dayOffset === 0) return "Aujourd'hui";
  if (dayOffset === 1) return "Demain";
  const short = format(date, "EEE d MMM", { locale: fr });
  return short.charAt(0).toUpperCase() + short.slice(1);
}

function totalUpcomingEvents(groups: UpcomingDayGroup[]): number {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

function shortCalendarLabel(type: HubEvent["type"]): string {
  switch (type) {
    case "maelle":
      return "Maelle";
    case "papa":
      return "François";
    case "roulle":
      return "Roullé";
    default:
      return "Rappel";
  }
}

function DayAgendaColumn({
  group,
  maxEvents = 2,
  variant = "bento",
}: {
  group: UpcomingDayGroup;
  maxEvents?: number;
  variant?: "bento" | "default" | "soft";
}) {
  const night = useHomeNight();
  const t = homeTone(night);
  const dayLabel = formatDayShortTitle(group.dayOffset, group.title, group.date);
  const events = group.items.slice(0, maxEvents);
  const hiddenCount = group.items.length - events.length;
  const isSoon = group.dayOffset <= 1;

  if (variant === "soft") {
    const dayTitleClass =
      group.dayOffset === 0
        ? t.today
        : group.dayOffset === 1
          ? t.tomorrow
          : t.ink;

    return (
      <div
        className={`home-agenda-day flex w-[14rem] shrink-0 flex-col sm:w-[15.5rem] lg:w-[16.5rem] ${
          isSoon ? "home-agenda-day--soon" : ""
        }`}
      >
        <div
          className="mb-3 flex items-baseline justify-between gap-2 border-b border-slate-200/50 pb-2"
        >
          <h3 className={`text-sm font-bold tracking-tight ${dayTitleClass}`}>
            {dayLabel}
          </h3>
          {group.items.length > 0 && (
            <span className={`text-xs font-semibold tabular-nums ${t.muted}`}>
              {group.items.length}
            </span>
          )}
        </div>

        {events.length === 0 ? (
          <p className={`py-2 text-sm font-medium ${t.faint}`}>—</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map(({ event }) => {
              const typeStyle = getEventTypeStyle(event.type, event);
              const time = formatEventTime(event);
              const title = formatUpcomingEventTitle({ event });

              return (
                <li key={event.id} className={`border-l-2 pl-3 ${typeStyle.accent}`}>
                  <div className="flex items-baseline gap-2">
                    {time && (
                      <span className={`text-xs font-bold tabular-nums ${t.soft}`}>
                        {time}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide ${t.muted}`}
                    >
                      {shortCalendarLabel(event.type)}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 line-clamp-2 text-sm font-semibold leading-snug ${t.ink}`}
                  >
                    {title}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {hiddenCount > 0 && (
          <p className={`mt-2 text-xs font-semibold ${t.link}`}>
            +{hiddenCount}
          </p>
        )}
      </div>
    );
  }

  const widthClass =
    variant === "bento"
      ? "home-agenda-day w-[17.5rem] sm:w-[19rem] lg:w-[21rem]"
      : "w-[11rem] sm:w-[12rem]";

  return (
    <Link
      href="/calendar"
      prefetch
      className={`flex h-full min-h-[15rem] shrink-0 flex-col rounded-2xl border border-white/70 bg-white/85 p-3.5 shadow-sm backdrop-blur-sm transition-transform active:scale-[0.99] sm:min-h-[16rem] sm:p-4 ${widthClass} ${
        isSoon ? "home-event-card--soon ring-1 ring-sky-200/50" : ""
      }`}
    >
      <div className="mb-3 flex shrink-0 items-start justify-between gap-2">
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase leading-tight tracking-wide sm:text-sm ${
            group.dayOffset === 0
              ? "bg-violet-100 text-violet-800"
              : group.dayOffset === 1
                ? "bg-sky-100 text-sky-800"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {dayLabel}
        </span>
        {group.items.length > 0 && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold tabular-nums text-slate-600">
            {group.items.length}
          </span>
        )}
      </div>

      {events.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-6 text-center text-base font-medium text-slate-400">
          Rien de prévu
        </p>
      ) : (
        <ul className="home-agenda-events flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-0.5">
          {events.map(({ event }) => {
            const typeStyle = getEventTypeStyle(event.type, event);
            const time = formatEventTime(event);
            const title = formatUpcomingEventTitle({ event });

            return (
              <li
                key={event.id}
                className={`home-agenda-event flex min-h-[5.5rem] flex-col rounded-xl border border-white/70 bg-white px-3 py-3 shadow-sm ${typeStyle.accent} border-l-4`}
              >
                <div className="flex items-center justify-between gap-2">
                  {time ? (
                    <span className="text-sm font-bold tabular-nums text-slate-700 sm:text-base">
                      {time}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-500">—</span>
                  )}
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold sm:text-xs ${typeStyle.pill}`}
                  >
                    {shortCalendarLabel(event.type)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 flex-1 text-[15px] font-bold leading-snug text-slate-900 sm:text-base sm:leading-snug">
                  {title}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {hiddenCount > 0 && (
        <p className="mt-2.5 shrink-0 text-center text-xs font-bold text-sky-700 sm:text-sm">
          +{hiddenCount} autre{hiddenCount > 1 ? "s" : ""}
        </p>
      )}
    </Link>
  );
}

type HomeNextUpStripProps = {
  layout?: "strip" | "panel" | "bento" | "soft";
};

export function HomeNextUpStrip({ layout = "strip" }: HomeNextUpStripProps) {
  const night = useHomeNight();
  const t = homeTone(night);
  const { events: hubEvents, syncStatus, refresh } = useCalendarEvents();
  const webhook = useWebhookCalendarEvents();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const daySlots = useMemo(() => {
    const calendarEvents = mergeHubEvents(hubEvents, webhook.events);
    return getNextCalendarDaySlots(calendarEvents, now);
  }, [hubEvents, webhook.events, now]);

  const flatEvents = useMemo(() => {
    const calendarEvents = mergeHubEvents(hubEvents, webhook.events);
    const groups = getUpcomingEventsByDay(calendarEvents, now);
    const items: FlatEvent[] = [];

    for (const group of groups) {
      for (const item of group.items) {
        const { event } = item;
        items.push({
          id: `${event.id}-${group.dayOffset}`,
          dayTitle: group.title,
          dayOffset: group.dayOffset,
          time: formatEventTime(event),
          title: formatUpcomingEventTitle(item),
          typeStyle: getEventTypeStyle(event.type, event),
        });
      }
    }

    return items.slice(0, layout === "panel" ? 5 : 3);
  }, [hubEvents, webhook.events, now, layout]);

  async function handleRefresh() {
    await Promise.all([refresh({ force: true }), webhook.refresh()]);
  }

  const upcomingCount = totalUpcomingEvents(daySlots);

  if (layout === "soft") {
    return (
      <section className="flex h-full min-h-0 flex-col">
        <div className="mb-4 flex shrink-0 items-end justify-between gap-3">
          <div>
            <h2
              className={`text-lg font-medium tracking-tight sm:text-xl ${t.ink}`}
            >
              Calendrier
            </h2>
            <p className={`text-sm font-medium ${t.muted}`}>
              {upcomingCount > 0
                ? `${upcomingCount} événement${upcomingCount !== 1 ? "s" : ""} · 8 jours`
                : "8 prochains jours"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarRefreshButton
              status={syncStatus}
              onRefresh={() => void handleRefresh()}
            />
            <Link
              href="/calendar"
              prefetch
              className={`touch-target text-sm font-medium active:opacity-70 ${t.link}`}
            >
              Voir tout →
            </Link>
          </div>
        </div>

        <div className="home-hscroll home-agenda-scroll min-h-0 flex-1 overflow-x-auto overflow-y-auto pb-1">
          <div className="flex min-h-full items-start gap-7 sm:gap-9 lg:gap-10">
            {daySlots.map((group) => (
              <DayAgendaColumn
                key={group.date.toISOString()}
                group={group}
                variant="soft"
                maxEvents={3}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "bento") {
    return (
      <BentoCard
        variant="gradient"
        gradient={PASTEL_GRADIENTS.calendar}
        className="flex h-full min-h-0 flex-col overflow-hidden p-3.5 sm:p-4"
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Agenda</h2>
            <p className="text-sm font-medium text-slate-600">
              {upcomingCount > 0
                ? `${upcomingCount} événement${upcomingCount !== 1 ? "s" : ""} · 8 prochains jours`
                : "8 prochains jours"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarRefreshButton
              status={syncStatus}
              onRefresh={() => void handleRefresh()}
            />
            <Link
              href="/calendar"
              prefetch
              className="touch-target rounded-xl border border-white/60 bg-white/80 px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm active:bg-white"
            >
              Calendrier →
            </Link>
          </div>
        </div>

        <div className="home-hscroll home-agenda-scroll min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-1">
          <div className="flex min-h-[15rem] items-stretch gap-3 sm:min-h-[16rem] sm:gap-3.5">
            {daySlots.map((group) => (
              <DayAgendaColumn
                key={group.date.toISOString()}
                group={group}
                variant="bento"
                maxEvents={2}
              />
            ))}
            <Link
              href="/calendar"
              prefetch
              className="flex w-[7.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200/80 bg-white/50 p-4 text-center active:bg-white/70 sm:w-[8rem]"
            >
              <CalendarDays className="h-7 w-7 text-slate-400" strokeWidth={2} />
              <span className="text-sm font-bold text-slate-600">Tout voir</span>
            </Link>
          </div>
        </div>
      </BentoCard>
    );
  }

  if (upcomingCount === 0) {
    if (layout === "panel") {
      return (
        <BentoCard className="flex h-full w-full flex-col justify-center p-4 text-center sm:p-5">
          <CalendarDays className="mx-auto h-8 w-8 text-slate-300" strokeWidth={1.5} />
          <p className="mt-2 text-sm font-semibold text-slate-500">Rien à venir</p>
          <Link
            href="/calendar"
            className="mt-3 text-sm font-bold text-sky-600 active:opacity-70"
          >
            Ouvrir l&apos;agenda
          </Link>
        </BentoCard>
      );
    }
    return null;
  }

  if (layout === "panel") {
    return (
      <BentoCard
        variant="gradient"
        gradient={PASTEL_GRADIENTS.calendar}
        className="flex h-full w-full min-h-0 flex-col overflow-hidden p-3.5 sm:p-4"
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-800 sm:text-base">À venir</h2>
            <p className="text-xs font-medium text-slate-500">Demain → J+4</p>
          </div>
          <div className="flex items-center gap-1">
            <CalendarRefreshButton
              status={syncStatus}
              onRefresh={() => void handleRefresh()}
            />
            <Link
              href="/calendar"
              prefetch
              className="touch-target flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-500 shadow-sm active:bg-white"
              aria-label="Voir le calendrier"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        <ul className="kiosk-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
          {flatEvents.map((item) => (
            <li key={item.id}>
              <Link
                href="/calendar"
                prefetch
                className={`home-next-item flex items-start gap-2.5 rounded-xl border border-white/55 bg-white/60 px-2.5 py-2.5 shadow-sm backdrop-blur-sm transition-transform active:scale-[0.99] sm:px-3 sm:py-3 ${
                  item.dayOffset === 1 ? "ring-1 ring-sky-200/50" : ""
                }`}
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.typeStyle.dot}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide ${
                        item.dayOffset === 1 ? "text-sky-700" : "text-slate-400"
                      }`}
                    >
                      {item.dayTitle}
                    </span>
                    {item.time && (
                      <span className="shrink-0 text-xs font-bold tabular-nums text-slate-600">
                        {item.time}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-800">
                    {item.title}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/calendar"
          prefetch
          className="mt-2 flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/60 bg-white/50 py-2 text-xs font-bold text-slate-600 active:bg-white/80 sm:text-sm"
        >
          Tout l&apos;agenda
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </BentoCard>
    );
  }

  return (
    <section className="min-w-0 shrink-0">
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-800 sm:text-base">À venir</h2>
          <p className="text-xs font-medium text-slate-400">3 prochains événements</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <CalendarRefreshButton
            status={syncStatus}
            onRefresh={() => void handleRefresh()}
          />
          <Link
            href="/calendar"
            prefetch
            className="touch-target flex h-9 w-9 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-500 shadow-sm active:bg-white sm:h-10 sm:w-10"
            aria-label="Voir le calendrier"
          >
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className="home-hscroll -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1">
        {flatEvents.map((item) => (
          <Link
            key={item.id}
            href="/calendar"
            prefetch
            className={`home-event-card group relative flex w-[10.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-3 shadow-sm backdrop-blur-sm transition-transform active:scale-[0.98] sm:w-[11.5rem] ${
              item.dayOffset === 1 ? "home-event-card--soon" : ""
            }`}
          >
            <span
              className={`mb-2 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                item.dayOffset === 1
                  ? "bg-sky-100 text-sky-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {item.dayTitle}
            </span>
            {item.time && (
              <span className="text-lg font-bold tabular-nums text-slate-800">
                {item.time}
              </span>
            )}
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate-700">
              {item.title}
            </p>
            <span
              className={`mt-2 w-fit rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${item.typeStyle.pill}`}
            >
              {item.typeStyle.label}
            </span>
          </Link>
        ))}

        <Link
          href="/calendar"
          prefetch
          className="flex w-[7rem] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200/80 bg-white/40 p-3 text-center active:bg-white/60"
        >
          <CalendarDays className="h-6 w-6 text-slate-400" strokeWidth={2} />
          <span className="text-xs font-bold text-slate-500">Tout voir</span>
        </Link>
      </div>
    </section>
  );
}
