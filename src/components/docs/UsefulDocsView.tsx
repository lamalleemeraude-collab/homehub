"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  Bus,
  ExternalLink,
  FileText,
  GraduationCap,
  UtensilsCrossed,
} from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { HubPageHeader } from "@/components/ui/HubPageHeader";
import {
  BREIZHGO_URL,
  BUS_PDF_PATH,
  BUS_TRIPS,
  WEEKDAY_INDICES,
  WEEKDAY_SHORT,
  busScheduleRows,
  departTimeOnDay,
  directionLabel,
  formatDayName,
  tripsForDate,
  type BusTrip,
} from "@/lib/bus-schedule";
import { PASTEL_GRADIENTS, PASTEL_ICON, SOFT_CTA } from "@/lib/ui/pastel-theme";

const EXTERNAL_LINKS = [
  {
    id: "ecoledirecte",
    label: "EcoleDirecte",
    description: "Notes, messagerie & absences",
    href: "https://www.ecoledirecte.com/login?cameFrom=%2F1%2F3092%2FMessagerie",
    icon: GraduationCap,
    iconGradient: PASTEL_ICON.school,
    chip: PASTEL_GRADIENTS.school,
    ring: "active:ring-sky-200/60",
  },
  {
    id: "clicetmiam",
    label: "Clic et Miam",
    description: "Menus cantine Convivio",
    href: "https://www.clicetmiam.fr/connexion",
    icon: UtensilsCrossed,
    iconGradient: PASTEL_ICON.canteen,
    chip: PASTEL_GRADIENTS.canteen,
    ring: "active:ring-emerald-200/60",
  },
] as const;

const TRIP_STYLE: Record<
  BusTrip["direction"],
  { badge: string; row: string; today: string }
> = {
  aller: {
    badge: "bg-sky-100 text-sky-900",
    row: "bg-sky-50/80",
    today: "border-sky-300 bg-gradient-to-br from-sky-50 to-blue-50",
  },
  "retour-midi": {
    badge: "bg-amber-100 text-amber-950",
    row: "bg-amber-50/80",
    today: "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50",
  },
  retour: {
    badge: "bg-indigo-100 text-indigo-950",
    row: "bg-indigo-50/80",
    today: "border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50",
  },
};

function TodayTripCard({ trip }: { trip: BusTrip }) {
  const style = TRIP_STYLE[trip.direction];

  return (
    <div className={`rounded-2xl border border-white/60 p-4 shadow-sm sm:p-5 ${style.today}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide sm:text-sm ${style.badge}`}
        >
          {directionLabel(trip.direction)}
        </span>
        <span className="text-sm font-bold text-slate-500 sm:text-base">
          Ligne {trip.line}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-5xl font-black tabular-nums leading-none text-slate-900 sm:text-6xl">
          {trip.departTime}
        </p>
        <p className="text-2xl font-bold text-slate-300 sm:text-3xl">→</p>
        <p className="text-3xl font-black tabular-nums leading-none text-slate-700 sm:text-4xl">
          {trip.arriveTime}
        </p>
      </div>
    </div>
  );
}

function BusWeekGrid() {
  const rows = busScheduleRows();
  const todayIndex = new Date().getDay();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse text-center">
          <thead>
            <tr className="border-b border-slate-100 bg-white/50">
              <th className="px-2 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-500 sm:px-4 sm:text-sm">
                Trajet
              </th>
              {WEEKDAY_INDICES.map((day) => (
                <th
                  key={day}
                  className={`px-1 py-3 text-sm font-black sm:px-2 sm:text-base ${
                    day === todayIndex
                      ? "bg-amber-100 text-amber-900"
                      : "text-slate-700"
                  }`}
                >
                  {WEEKDAY_SHORT[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const style = TRIP_STYLE[row.trip.direction];
              return (
                <tr
                  key={row.id}
                  className={`border-b border-slate-200 last:border-b-0 ${style.row}`}
                >
                  <td className="px-2 py-3 text-left sm:px-4 sm:py-4">
                    <p className="text-sm font-black text-slate-800 sm:text-base">
                      {row.label}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500 sm:text-sm">
                      {row.trip.departTime} → {row.trip.arriveTime}
                    </p>
                  </td>
                  {WEEKDAY_INDICES.map((day) => {
                    const time = departTimeOnDay(row.trip, day);
                    const isToday = day === todayIndex;
                    return (
                      <td
                        key={day}
                        className={`px-1 py-3 sm:px-2 sm:py-4 ${
                          isToday ? "bg-amber-50/60" : ""
                        }`}
                      >
                        {time ? (
                          <span
                            className={`inline-block rounded-xl px-2 py-1.5 text-lg font-black tabular-nums sm:text-2xl ${
                              isToday
                                ? "bg-amber-200 text-amber-950"
                                : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                            }`}
                          >
                            {time}
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-slate-300 sm:text-xl">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BusStopsLegend() {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500 sm:text-sm">
        Horaires indicatifs
      </p>
      <ul className="space-y-3">
        {BUS_TRIPS.map((trip) => (
          <li
            key={trip.id}
            className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700 sm:text-base"
          >
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-black ${TRIP_STYLE[trip.direction].badge}`}
            >
              {directionLabel(trip.direction)}
            </span>
            <span className="font-black tabular-nums text-slate-900">
              {trip.departTime} → {trip.arriveTime}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UsefulDocsView() {
  const today = useMemo(() => new Date(), []);
  const todayIndex = today.getDay();
  const todayTrips = useMemo(() => tripsForDate(today), [today]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <HubPageHeader
        accent="bus"
        icon={FileText}
        eyebrow="Accès rapides"
        title="Docs utiles"
        subtitle="Horaires bus, liens scolaires & cantine"
      />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <h2 className="text-lg font-black text-slate-800 sm:text-xl">
              🚌 Horaires de bus
            </h2>
            <div className="flex flex-wrap gap-2">
              <a
                href={BUS_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className={`touch-target flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold shadow-sm active:opacity-90 ${SOFT_CTA.default}`}
              >
                <FileText className="h-4 w-4" strokeWidth={2.5} />
                Fiche PDF
              </a>
              <a
                href={BREIZHGO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-300 to-orange-300 px-3 py-2 text-sm font-bold text-white shadow-sm active:opacity-90"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={2.5} />
                BreizhGo
              </a>
            </div>
          </div>

          <p className="mb-4 px-1 text-base font-semibold text-slate-600 sm:text-lg">
            Ligne DI10 · Maelle · Collège Sainte Marie
          </p>

          {todayTrips.length > 0 ? (
            <BentoCard className="mb-4 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Bus className="h-6 w-6 text-amber-500" strokeWidth={2.5} />
                <p className="text-base font-black text-amber-800 sm:text-lg">
                  Aujourd&apos;hui — {formatDayName(todayIndex)}
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {todayTrips.map((trip) => (
                  <TodayTripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </BentoCard>
          ) : (
            <BentoCard className="mb-4 p-5">
              <p className="text-lg font-bold text-slate-600 sm:text-xl">
                Pas de bus scolaire aujourd&apos;hui.
              </p>
            </BentoCard>
          )}

          <div className="space-y-3">
            <h3 className="px-1 text-base font-black text-slate-800 sm:text-lg">
              Semaine type
            </h3>
            <BusWeekGrid />
            <BusStopsLegend />
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-lg font-black text-slate-800 sm:text-xl">
            Liens utiles
          </h2>
          <div className="flex flex-col gap-2.5">
            {EXTERNAL_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`touch-target group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-white/50 bg-gradient-to-r ${link.chip} px-3 py-3 shadow-sm transition-transform active:scale-[0.98] sm:gap-4 sm:px-4 sm:py-3.5 ${link.ring}`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${link.iconGradient} shadow-md shadow-slate-200/25 sm:h-12 sm:w-12`}
                  >
                    <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black text-slate-800 sm:text-lg">
                      {link.label}
                    </p>
                    <p className="truncate text-xs font-semibold text-slate-500 sm:text-sm">
                      {link.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-slate-400 group-active:text-slate-600"
                    strokeWidth={2.5}
                  />
                </a>
              );
            })}
          </div>
        </section>
      </div>

      <Link
        href="/"
        className={`touch-target shrink-0 rounded-2xl px-4 py-3 text-center text-base font-bold ${SOFT_CTA.default}`}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
