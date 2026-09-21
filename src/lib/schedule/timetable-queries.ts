import {
  DAY_NAMES,
  TIME_SLOTS,
  WEEKLY_SCHEDULE,
  type BagTag,
  type CellVariant,
  type TimetableCell,
  type WeekDay,
} from "@/lib/schedule/scheduleData";

const WEEKDAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
] as const;

const SKIPPED_KINDS = new Set<TimetableCell["kind"]>([
  "perm",
  "self",
  "devf",
  "accompagnement",
]);

function isWeekDay(dayIndex: number): dayIndex is WeekDay {
  return dayIndex >= 1 && dayIndex <= 5;
}

function collectBagTagsFromVariant(variant: CellVariant): BagTag[] {
  return variant.bagTags ?? [];
}

export function collectBagTagsFromCell(cell: TimetableCell): BagTag[] {
  const tags = new Set<BagTag>();
  if (cell.bagTags) for (const tag of cell.bagTags) tags.add(tag);
  if (cell.variants) {
    for (const variant of cell.variants) {
      for (const tag of collectBagTagsFromVariant(variant)) tags.add(tag);
    }
  }
  return [...tags];
}

const TAG_LABELS: Record<BagTag, string> = {
  francais: "Français",
  mathematiques: "Maths",
  anglais: "Anglais",
  allemand: "Allemand",
  bilangue: "Bilangue",
  "histoire-geo": "Histoire-Géo",
  svt: "SVT",
  "physique-chimie": "Physique-Chimie",
  eps: "EPS",
  "arts-plastiques": "Arts plastiques",
  musique: "Musique",
  "vie-classe": "Vie de classe",
};

export function getDaySchedule(dayIndex: number): (TimetableCell | null)[] {
  if (!isWeekDay(dayIndex)) return [];
  return WEEKLY_SCHEDULE[dayIndex];
}

export function getTodayDayIndex(date = new Date()): number {
  return date.getDay();
}

export function getTomorrowDayIndex(date = new Date()): number {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getDay();
}

export function getTomorrowInfo(date = new Date()) {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayIndex = tomorrow.getDay();
  const dayName = WEEKDAY_NAMES[dayIndex];
  const subjects = subjectsForDay(dayIndex);
  const isWeekend = dayIndex === 0 || dayIndex === 6;

  return {
    date: tomorrow,
    dayName,
    dayIndex,
    subjects,
    isWeekend,
    label: isWeekend ? "Pas de cours" : dayName,
  };
}

export function formatTomorrowLabel(date = new Date()): string {
  const { dayName, isWeekend } = getTomorrowInfo(date);
  if (isWeekend) return "Week-end — pas de cours demain";
  return `Demain — ${dayName}`;
}

export function subjectsForDay(dayIndex: number): string[] {
  return bagTagsForDay(dayIndex).map((tag) => TAG_LABELS[tag]);
}

export function bagTagsForDay(dayIndex: number): BagTag[] {
  const cells = getDaySchedule(dayIndex);
  const tags = new Set<BagTag>();

  for (const cell of cells) {
    if (!cell || SKIPPED_KINDS.has(cell.kind)) continue;
    for (const tag of collectBagTagsFromCell(cell)) {
      tags.add(tag);
    }
  }

  return [...tags];
}

export function bagTagsForTomorrow(date = new Date()): BagTag[] {
  return bagTagsForDay(getTomorrowDayIndex(date));
}

export function hasBagTagTomorrow(tag: BagTag, date = new Date()): boolean {
  return bagTagsForTomorrow(date).includes(tag);
}

export function hasEpsTomorrow(date = new Date()): boolean {
  return hasBagTagTomorrow("eps", date);
}

export function hasArtsPlastiquesTomorrow(date = new Date()): boolean {
  return hasBagTagTomorrow("arts-plastiques", date);
}

export function getTimetableForDay(dayIndex: number) {
  const cells = getDaySchedule(dayIndex);
  return TIME_SLOTS.map((slot, index) => ({
    slot,
    cell: cells[index] ?? null,
  }));
}

export function getTodayTimetable(date = new Date()) {
  return getTimetableForDay(getTodayDayIndex(date));
}

export function getTomorrowTimetable(date = new Date()) {
  return getTimetableForDay(getTomorrowDayIndex(date));
}

export function dayNameForIndex(dayIndex: number): string {
  if (isWeekDay(dayIndex)) return DAY_NAMES[dayIndex];
  return WEEKDAY_NAMES[dayIndex] ?? "";
}

export function isSchoolDay(dayIndex: number): boolean {
  return isWeekDay(dayIndex);
}

/** True si ce créneau est couvert par le rowSpan du créneau précédent */
export function isSpannedSlot(day: WeekDay, slotIndex: number): boolean {
  if (slotIndex === 0) return false;
  const prev = WEEKLY_SCHEDULE[day][slotIndex - 1];
  return Boolean(prev?.rowSpan && prev.rowSpan > 1);
}

export function cellRowSpan(cell: TimetableCell | null): number {
  return cell?.rowSpan ?? 1;
}
