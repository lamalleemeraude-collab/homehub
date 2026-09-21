import {
  packItemsForTags,
  PERMANENT_PACK,
  SHARED_SCIENCES_PACK,
  SUBJECT_DAILY_PACKS,
  type PackItem,
} from "@/lib/bag-packing-engine";
import type { BagTag, TimetableCell } from "@/lib/schedule/scheduleData";
import { collectBagTagsFromCell, getTomorrowTimetable } from "@/lib/schedule/timetable-queries";

const SKIP_CELL_KINDS = new Set<TimetableCell["kind"]>([
  "perm",
  "self",
  "devf",
  "accompagnement",
]);

const SCIENCE_TAGS = new Set<BagTag>(["svt", "physique-chimie"]);

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

const TAG_EMOJI: Record<BagTag, string> = {
  francais: "📘",
  mathematiques: "🔢",
  anglais: "🇬🇧",
  allemand: "🇩🇪",
  bilangue: "🌍",
  "histoire-geo": "🗺️",
  svt: "🔬",
  "physique-chimie": "⚗️",
  eps: "👟",
  "arts-plastiques": "🎨",
  musique: "🎵",
  "vie-classe": "🏫",
};

export type BagSubjectGroup = {
  id: string;
  label: string;
  emoji: string;
  /** Heure du premier cours lié (ex. "08:25") */
  time?: string;
  tags: BagTag[];
  items: PackItem[];
};

function formatSlotTime(start: string): string {
  return start.slice(0, 5);
}

function labelForTags(tags: BagTag[]): string {
  if (tags.length === 1) return TAG_LABELS[tags[0]];
  if (tags.includes("bilangue") && tags.includes("allemand")) {
    return "Bilangue / Allemand";
  }
  return tags.map((t) => TAG_LABELS[t]).join(" · ");
}

function emojiForTags(tags: BagTag[]): string {
  return tags[0] ? TAG_EMOJI[tags[0]] : "📦";
}

function itemsForSubjectGroup(
  groupId: string,
  tags: BagTag[],
  fullPack: PackItem[]
): PackItem[] {
  const fullIds = new Set(fullPack.map((i) => i.id));

  if (groupId === "permanent") {
    return PERMANENT_PACK.filter((i) => fullIds.has(i.id));
  }

  if (groupId === "sciences") {
    const scienceIds = new Set([
      ...SHARED_SCIENCES_PACK.map((i) => i.id),
      ...(SUBJECT_DAILY_PACKS.svt ?? []).map((i) => i.id),
      ...(SUBJECT_DAILY_PACKS["physique-chimie"] ?? []).map((i) => i.id),
    ]);
    return fullPack.filter((i) => scienceIds.has(i.id));
  }

  const wanted = new Set<string>();
  for (const tag of tags) {
    for (const item of SUBJECT_DAILY_PACKS[tag] ?? []) {
      if (fullIds.has(item.id)) wanted.add(item.id);
    }
  }
  return fullPack.filter((i) => wanted.has(i.id));
}

type OrderedGroup = {
  id: string;
  tags: BagTag[];
  time?: string;
};

function resolveGroupKey(tags: BagTag[]): { id: string; tags: BagTag[] } {
  const sciences = tags.filter((t) => SCIENCE_TAGS.has(t));
  const others = tags.filter((t) => !SCIENCE_TAGS.has(t));

  if (sciences.length > 0 && others.length === 0) {
    return { id: "sciences", tags: sciences };
  }

  if (others.length === 1) {
    return { id: others[0], tags: others };
  }

  if (others.includes("bilangue")) {
    return { id: "bilangue", tags: others };
  }

  return { id: others.join("-") || "autre", tags: others };
}

/** Groupes matière ordonnés selon l'emploi du temps de demain. */
export function getBagSubjectGroups(
  bagTags: BagTag[],
  date = new Date()
): BagSubjectGroup[] {
  const fullPack = packItemsForTags(bagTags);
  const ordered: OrderedGroup[] = [];
  const seen = new Set<string>();

  for (const row of getTomorrowTimetable(date)) {
    const cell = row.cell;
    if (!cell || SKIP_CELL_KINDS.has(cell.kind)) continue;

    const cellTags = collectBagTagsFromCell(cell);
    if (cellTags.length === 0) continue;

    const { id, tags } = resolveGroupKey(cellTags);
    if (seen.has(id)) continue;
    seen.add(id);
    ordered.push({
      id,
      tags,
      time: formatSlotTime(row.slot.start),
    });
  }

  const groups: BagSubjectGroup[] = [
    {
      id: "permanent",
      label: "Toujours",
      emoji: "🎒",
      tags: [],
      items: itemsForSubjectGroup("permanent", [], fullPack),
    },
  ];

  for (const entry of ordered) {
    const label =
      entry.id === "sciences"
        ? "SVT & Physique-Chimie"
        : labelForTags(entry.tags);

    groups.push({
      id: entry.id,
      label,
      emoji: entry.id === "sciences" ? "🔬" : emojiForTags(entry.tags),
      time: entry.time,
      tags: entry.tags,
      items: itemsForSubjectGroup(entry.id, entry.tags, fullPack),
    });
  }

  return groups.filter((g) => g.items.length > 0);
}
