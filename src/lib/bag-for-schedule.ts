import {
  packItemsForTags,
  type PackItem,
  SUPPLIES_PDF_PATH,
} from "@/lib/bag-packing-engine";
import { expandBagItems, type BagSupplyItem } from "@/lib/bag-supplies";
import {
  bagTagsForTomorrow,
  getTomorrowInfo,
  getTomorrowTimetable,
} from "@/lib/schedule/timetable-queries";
import type { BagTag } from "@/lib/schedule/scheduleData";

export type BagPackResult = {
  items: PackItem[];
  expandedItems: BagSupplyItem[];
  subjects: string[];
  dayName: string;
  isWeekend: boolean;
  bagTags: BagTag[];
  /** Créneaux de demain (emploi du temps) */
  slots: { time: string; label: string }[];
  /** Chemin PDF liste fournitures officielle */
  suppliesPdfPath: string;
};

function packItemToSupply(item: PackItem): BagSupplyItem {
  const { reason: _r, essential: _e, ...supply } = item;
  return supply;
}

export function bagItemsForTomorrow(date = new Date()): BagPackResult {
  const { subjects, dayName, isWeekend } = getTomorrowInfo(date);

  if (isWeekend) {
    return {
      items: [],
      expandedItems: [],
      subjects: [],
      dayName,
      isWeekend: true,
      bagTags: [],
      slots: [],
      suppliesPdfPath: SUPPLIES_PDF_PATH,
    };
  }

  const bagTags = bagTagsForTomorrow(date);
  const items = packItemsForTags(bagTags);
  const supplies = items.map(packItemToSupply);

  const timetable = getTomorrowTimetable(date);
  const slots = timetable
    .filter((row) => row.cell && row.cell.kind !== "perm" && row.cell.kind !== "self")
    .map((row) => ({
      time: row.slot.label,
      label: row.cell!.shortLabel,
    }));

  return {
    items,
    expandedItems: expandBagItems(supplies),
    subjects,
    dayName,
    isWeekend: false,
    bagTags,
    slots,
    suppliesPdfPath: SUPPLIES_PDF_PATH,
  };
}

export function bagItemIdsForTag(tag: BagTag): string[] {
  return (packItemsForTags([tag]) ?? []).map((i) => i.id);
}
