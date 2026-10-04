import type { TideEvent, TideScheduleRaw } from "./types";

const PARIS_TZ = "Europe/Paris";
const HEIGHT_MIN_M = 0;
const HEIGHT_MAX_M = 14;

export function rawToEvent(raw: TideScheduleRaw): TideEvent {
  return {
    time: new Date(raw.iso),
    type: raw.type,
    label: raw.type === "high" ? "Pleine mer" : "Basse mer",
    heightM: raw.heightM,
    coefficient: raw.coefficient,
  };
}

export function buildSchedule(raw: TideScheduleRaw[]): TideEvent[] {
  return raw.map(rawToEvent).sort((a, b) => a.time.getTime() - b.time.getTime());
}

function findBracketing(
  schedule: TideEvent[],
  now: Date
): { prev: TideEvent; next: TideEvent } {
  if (schedule.length === 0) {
    const stub: TideEvent = {
      time: now,
      type: "high",
      label: "Pleine mer",
      heightM: 8,
    };
    return { prev: stub, next: stub };
  }
  const t = now.getTime();
  if (t <= schedule[0].time.getTime()) {
    return { prev: schedule[0], next: schedule[1] ?? schedule[0] };
  }
  const last = schedule[schedule.length - 1];
  if (t >= last.time.getTime()) {
    return { prev: schedule[schedule.length - 2] ?? last, next: last };
  }
  for (let i = 0; i < schedule.length - 1; i++) {
    if (
      t >= schedule[i].time.getTime() &&
      t < schedule[i + 1].time.getTime()
    ) {
      return { prev: schedule[i], next: schedule[i + 1] };
    }
  }
  return { prev: schedule[0], next: schedule[1] ?? schedule[0] };
}

export function getTideWaterLevel(schedule: TideEvent[], now = new Date()): number {
  const { prev, next } = findBracketing(schedule, now);
  const span = next.time.getTime() - prev.time.getTime();
  if (span <= 0) return normalizeHeight(prev.heightM);
  const t = (now.getTime() - prev.time.getTime()) / span;
  const eased = (1 - Math.cos(t * Math.PI)) / 2;
  const heightM = prev.heightM + (next.heightM - prev.heightM) * eased;
  return normalizeHeight(heightM);
}

export function getCurrentTideHeight(
  schedule: TideEvent[],
  now = new Date()
): number {
  const { prev, next } = findBracketing(schedule, now);
  const span = next.time.getTime() - prev.time.getTime();
  if (span <= 0) return prev.heightM;
  const t = (now.getTime() - prev.time.getTime()) / span;
  const eased = (1 - Math.cos(t * Math.PI)) / 2;
  return (
    Math.round((prev.heightM + (next.heightM - prev.heightM) * eased) * 100) /
    100
  );
}

function normalizeHeight(heightM: number): number {
  return Math.max(
    0,
    Math.min(1, (heightM - HEIGHT_MIN_M) / (HEIGHT_MAX_M - HEIGHT_MIN_M))
  );
}

export function getUpcomingTides(
  schedule: TideEvent[],
  now = new Date(),
  limit = 4
): TideEvent[] {
  const t = now.getTime() - 60_000;
  return schedule.filter((e) => e.time.getTime() >= t).slice(0, limit);
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

export function currentTidePhase(
  schedule: TideEvent[],
  now = new Date()
): "rising" | "falling" {
  const upcoming = getUpcomingTides(schedule, now, 1);
  if (upcoming.length === 0) return "rising";
  return upcoming[0].type === "high" ? "rising" : "falling";
}

export function currentTideCoefficient(
  schedule: TideEvent[],
  now = new Date()
): number | undefined {
  const { prev, next } = findBracketing(schedule, now);
  return prev.coefficient ?? next.coefficient;
}

export function getTideCycleProgress(
  schedule: TideEvent[],
  now = new Date()
): number {
  const highs = schedule.filter((e) => e.type === "high");
  if (highs.length < 2) return 0;
  const t = now.getTime();
  let last = highs[0];
  let next = highs[1];
  for (let i = 0; i < highs.length; i++) {
    if (highs[i].time.getTime() <= t) last = highs[i];
    if (highs[i].time.getTime() > t) {
      next = highs[i];
      break;
    }
  }
  const span = next.time.getTime() - last.time.getTime();
  if (span <= 0) return 0;
  return Math.max(0, Math.min(1, (t - last.time.getTime()) / span));
}

export function getTideNeedleAngle(
  schedule: TideEvent[],
  now = new Date()
): number {
  return getTideCycleProgress(schedule, now) * 360;
}
