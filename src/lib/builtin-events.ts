import type { HubEvent } from "./hub-events";

/** Événements intégrés au hub (rappels locaux). */
export function getBuiltinEvents(_referenceDate: Date = new Date()): HubEvent[] {
  return [];
}
