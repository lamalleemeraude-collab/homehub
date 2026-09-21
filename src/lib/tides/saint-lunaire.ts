/**
 * Marées Saint-Lunaire — horaires réels (horaire-maree.fr).
 */

import {
  SAINT_LUNAIRE_TIDE_SCHEDULE,
  TIDE_DATA_SOURCE_URL,
  TIDE_DATA_VALID_UNTIL,
  type TideScheduleRaw,
} from "./saint-lunaire-schedule";
import { SAINT_LUNAIRE } from "@/lib/weather/location";

export type TideEvent = {
  time: Date;
  type: "high" | "low";
  label: string;
  heightM: number;
  coefficient?: number;
};

const PARIS_TZ = "Europe/Paris";
const HEIGHT_MIN_M = 0;
const HEIGHT_MAX_M = 13;

function rawToEvent(raw: TideScheduleRaw): TideEvent {
  return {
    time: new Date(raw.iso),
    type: raw.type,
    label: raw.type === "high" ? "Pleine mer" : "Basse mer",
    heightM: raw.heightM,
    coefficient: raw.coefficient,
  };
}

const SCHEDULE: TideEvent[] = SAINT_LUNAIRE_TIDE_SCHEDULE.map(rawToEvent).sort(
  (a, b) => a.time.getTime() - b.time.getTime()
);

function findBracketing(now: Date): { prev: TideEvent; next: TideEvent } {
  const t = now.getTime();

  if (t <= SCHEDULE[0].time.getTime()) {
    return { prev: SCHEDULE[0], next: SCHEDULE[1] ?? SCHEDULE[0] };
  }

  const last = SCHEDULE[SCHEDULE.length - 1];
  if (t >= last.time.getTime()) {
    const prev = SCHEDULE[SCHEDULE.length - 2] ?? last;
    return { prev, next: last };
  }

  for (let i = 0; i < SCHEDULE.length - 1; i++) {
    const prev = SCHEDULE[i];
    const next = SCHEDULE[i + 1];
    if (t >= prev.time.getTime() && t < next.time.getTime()) {
      return { prev, next };
    }
  }

  return { prev: SCHEDULE[0], next: SCHEDULE[1] };
}

function findLastHighBefore(now: Date): TideEvent {
  const t = now.getTime();
  for (let i = SCHEDULE.length - 1; i >= 0; i--) {
    const event = SCHEDULE[i];
    if (event.type === "high" && event.time.getTime() <= t) {
      return event;
    }
  }
  return SCHEDULE.find((e) => e.type === "high") ?? SCHEDULE[0];
}

function findNextHighAfter(now: Date): TideEvent {
  const t = now.getTime();
  for (const event of SCHEDULE) {
    if (event.type === "high" && event.time.getTime() > t) {
      return event;
    }
  }
  const highs = SCHEDULE.filter((e) => e.type === "high");
  return highs[highs.length - 1];
}

/** 0 = pleine mer (aiguille en haut), 0.5 = basse mer, 1 = pleine mer suivante. */
export function getTideCycleProgress(now = new Date()): number {
  const lastHigh = findLastHighBefore(now);
  const nextHigh = findNextHighAfter(now);
  const span = nextHigh.time.getTime() - lastHigh.time.getTime();
  if (span <= 0) return 0;
  const elapsed = now.getTime() - lastHigh.time.getTime();
  return Math.max(0, Math.min(1, elapsed / span));
}

export function getTideNeedleAngle(now = new Date()): number {
  return getTideCycleProgress(now) * 360;
}

/** Niveau d'eau normalisé 0–1 d'après les hauteurs réelles. */
export function getTideWaterLevel(now = new Date()): number {
  const { prev, next } = findBracketing(now);
  const span = next.time.getTime() - prev.time.getTime();
  if (span <= 0) return normalizeHeight(prev.heightM);

  const t = (now.getTime() - prev.time.getTime()) / span;
  const eased = (1 - Math.cos(t * Math.PI)) / 2;
  const heightM = prev.heightM + (next.heightM - prev.heightM) * eased;
  return normalizeHeight(heightM);
}

export function getCurrentTideHeight(now = new Date()): number {
  const { prev, next } = findBracketing(now);
  const span = next.time.getTime() - prev.time.getTime();
  if (span <= 0) return prev.heightM;
  const t = (now.getTime() - prev.time.getTime()) / span;
  const eased = (1 - Math.cos(t * Math.PI)) / 2;
  return Math.round((prev.heightM + (next.heightM - prev.heightM) * eased) * 100) / 100;
}

function normalizeHeight(heightM: number): number {
  return Math.max(
    0,
    Math.min(1, (heightM - HEIGHT_MIN_M) / (HEIGHT_MAX_M - HEIGHT_MIN_M))
  );
}

export function getUpcomingTides(now = new Date(), limit = 4): TideEvent[] {
  const t = now.getTime() - 60_000;
  return SCHEDULE.filter((event) => event.time.getTime() >= t).slice(0, limit);
}

export function formatTideTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: PARIS_TZ,
  });
}

export function formatTideHeight(heightM: number): string {
  return `${heightM.toFixed(2).replace(".", ",")} m`;
}

export function currentTidePhase(now = new Date()): "rising" | "falling" {
  const upcoming = getUpcomingTides(now, 1);
  if (upcoming.length === 0) return "rising";
  return upcoming[0].type === "high" ? "rising" : "falling";
}

export function currentTideCoefficient(now = new Date()): number | undefined {
  const { prev, next } = findBracketing(now);
  return prev.coefficient ?? next.coefficient;
}

export const SAINT_LUNAIRE_TIDES = {
  lat: SAINT_LUNAIRE.latitude,
  lon: SAINT_LUNAIRE.longitude,
  label: SAINT_LUNAIRE.name,
  sourceUrl: TIDE_DATA_SOURCE_URL,
  validUntil: TIDE_DATA_VALID_UNTIL,
};

export function isTideDataStale(now = new Date()): boolean {
  const limit = new Date(`${TIDE_DATA_VALID_UNTIL}T23:59:59+02:00`);
  return now > limit;
}
