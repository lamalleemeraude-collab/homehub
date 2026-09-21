"use client";

import { useMemo } from "react";
import { Briefcase, GraduationCap, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import {
  formatEventSchedule,
  getEventTypeStyle,
  mergeHubEvents,
  type HubEvent,
  type HubEventType,
} from "@/lib/hub-events";
import { useWebhookCalendarEvents } from "@/contexts/WebhookCalendarContext";

const WEEK_PANELS: {
  type: HubEventType;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconGradient: string;
}[] = [
  {
    type: "maelle",
    title: "MAELLE",
    subtitle: "iCloud · rdv & événements scolaires",
    icon: GraduationCap,
    iconGradient: "from-sky-300 to-indigo-400",
  },
  {
    type: "papa",
    title: "FRANÇOIS",
    subtitle: "iCloud · Papa",
    icon: Briefcase,
    iconGradient: "from-rose-300 to-rose-400",
  },
  {
    type: "roulle",
    title: "PHILIPPE ROULLÉ",
    subtitle: "Exchange · Philippe ROULLÉ",
    icon: UserRound,
    iconGradient: "from-amber-300 to-[#d4a853]",
  },
];

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDaysFromToday(reference: Date): Date[] {
  const start = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate()
  );
  const dayOfWeek = start.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 2;
    const monday = new Date(start);
    monday.setDate(start.getDate() + daysUntilMonday);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor.getDay() >= 1 && cursor.getDay() <= 5) {
    days.push(new Date(cursor));
    if (cursor.getDay() === 5) break;
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function isTodayInRange(days: Date[], todayKey: string): boolean {
  return days.some((d) => toDateKey(d) === todayKey);
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function WeekAgendaPanel({
  type,
  title,
  subtitle,
  icon: Icon,
  iconGradient,
  events,
  weekDays,
  todayKey,
}: {
  type: HubEventType;
  title: string;
  subtitle: string;
  icon: typeof Briefcase;
  iconGradient: string;
  events: HubEvent[];
  weekDays: Date[];
  todayKey: string;
}) {
  const style = getEventTypeStyle(type);
  const weekKeys = useMemo(() => weekDays.map(toDateKey), [weekDays]);

  const weekEvents = useMemo(
    () =>
      events
        .filter((e) => weekKeys.includes(e.date))
        .sort(
          (a, b) =>
            new Date(a.start ?? a.date).getTime() -
            new Date(b.start ?? b.date).getTime()
        ),
    [events, weekKeys]
  );

  const totalCount = weekEvents.length;

  return (
    <BentoCard className="flex h-full min-h-0 flex-col overflow-hidden !bg-white/45">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/50 px-4 py-3 sm:px-5 sm:py-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient}`}
        >
          <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-slate-800 sm:text-lg">
            {title}
          </p>
          <p className="text-xs font-semibold text-slate-400 sm:text-sm">
            {subtitle} · {totalCount} événement{totalCount !== 1 ? "s" : ""} à
            venir
          </p>
        </div>
      </div>

      <div className="kiosk-scroll min-h-0 flex-1 space-y-3 p-3 sm:space-y-4 sm:p-4">
        {weekDays.map((day) => {
          const dateKey = toDateKey(day);
          const dayEvents = weekEvents.filter((e) => e.date === dateKey);
          const isToday = dateKey === todayKey;

          return (
            <section key={dateKey}>
              <div
                className={`mb-2 flex items-center gap-2 rounded-xl px-3 py-1.5 ${
                  isToday
                    ? "bg-gradient-to-r from-sky-400 to-indigo-400 text-white shadow-sm shadow-sky-200/30"
                    : "border border-white/50 bg-white/55 text-slate-600"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wide sm:text-sm">
                  {formatDayHeader(day)}
                </span>
                {isToday && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                    Aujourd&apos;hui
                  </span>
                )}
                {dayEvents.length > 0 && (
                  <span
                    className={`ml-auto text-xs font-bold ${
                      isToday ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {dayEvents.length === 0 ? (
                <p className="px-2 py-2 text-sm font-semibold text-slate-300">
                  Aucun événement
                </p>
              ) : (
                <div className="space-y-1.5">
                  {dayEvents.map((event) => {
                    const eventStyle = getEventTypeStyle(event.type, event);
                    return (
                      <div
                        key={event.id}
                        className={`flex overflow-hidden rounded-xl border border-white/60 bg-white/75 shadow-sm ${eventStyle.accent} border-l-[3px]`}
                      >
                        <div className="min-w-0 flex-1 px-3 py-2.5">
                          <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                            {event.title}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            {eventStyle.label} · {formatEventSchedule(event)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </BentoCard>
  );
}

export function WeeklyCalendar() {
  const { events: hubEvents } = useCalendarEvents();
  const webhook = useWebhookCalendarEvents();
  const allEvents = useMemo(
    () => mergeHubEvents(hubEvents, webhook.events),
    [hubEvents, webhook.events]
  );
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const weekDays = useMemo(() => getDaysFromToday(today), [today]);
  const startsToday = isTodayInRange(weekDays, todayKey);

  const rangeStart = weekDays[0]?.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
  const rangeEnd = weekDays[weekDays.length - 1]?.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  const rangeLabel = startsToday
    ? `À partir d'aujourd'hui · jusqu'au ${rangeEnd}`
    : `Semaine prochaine · du ${rangeStart} au ${rangeEnd}`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-4">
      <p className="shrink-0 px-1 text-sm font-bold capitalize text-slate-500 sm:text-base">
        {rangeLabel}
      </p>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-auto overscroll-contain sm:gap-4 lg:grid-cols-2 xl:grid-cols-3 xl:overflow-hidden">
        {WEEK_PANELS.map((panel) => (
          <div key={panel.type} className="min-h-0 xl:h-full">
            <WeekAgendaPanel
              type={panel.type}
              title={panel.title}
              subtitle={panel.subtitle}
              icon={panel.icon}
              iconGradient={panel.iconGradient}
              events={allEvents.filter((e) => e.type === panel.type)}
              weekDays={weekDays}
              todayKey={todayKey}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
