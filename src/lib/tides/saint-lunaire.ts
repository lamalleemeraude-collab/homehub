/**
 * Compat — le hub utilise désormais Saint-Malo (maree.info).
 * Ces helpers s’appuient sur le fallback local si appelés hors contexte API.
 */

import { SAINT_MALO_FALLBACK_SCHEDULE } from "./saint-malo-fallback";
import {
  buildSchedule,
  currentTideCoefficient as coefFrom,
  currentTidePhase as phaseFrom,
  formatTideHeight,
  formatTideTime,
  getCurrentTideHeight as heightFrom,
  getTideCycleProgress as progressFrom,
  getTideNeedleAngle as angleFrom,
  getTideWaterLevel as levelFrom,
  getUpcomingTides as upcomingFrom,
} from "./engine";
import type { TideEvent } from "./types";

export type { TideEvent };
export { formatTideHeight, formatTideTime };

const SCHEDULE = buildSchedule(SAINT_MALO_FALLBACK_SCHEDULE);

export function getTideCycleProgress(now = new Date()): number {
  return progressFrom(SCHEDULE, now);
}

export function getTideNeedleAngle(now = new Date()): number {
  return angleFrom(SCHEDULE, now);
}

export function getTideWaterLevel(now = new Date()): number {
  return levelFrom(SCHEDULE, now);
}

export function getCurrentTideHeight(now = new Date()): number {
  return heightFrom(SCHEDULE, now);
}

export function getUpcomingTides(now = new Date(), limit = 4): TideEvent[] {
  return upcomingFrom(SCHEDULE, now, limit);
}

export function currentTidePhase(now = new Date()): "rising" | "falling" {
  return phaseFrom(SCHEDULE, now);
}

export function currentTideCoefficient(now = new Date()): number | undefined {
  return coefFrom(SCHEDULE, now);
}

export const SAINT_LUNAIRE_TIDES = {
  lat: 48.7008,
  lon: -2.0933,
  label: "Saint-Malo",
  sourceUrl: "https://maree.info/52",
  validUntil: "2026-10-10",
};

export function isTideDataStale(now = new Date()): boolean {
  return now > new Date("2026-10-10T23:59:59+02:00");
}
