import {
  CATEGORY_ORDER,
  type ShoppingCategory,
  type ShoppingItem,
} from "@/lib/shopping-categories";
import { productEmojiForLabel } from "@/lib/shopping-product-icon";

const STORAGE_KEY = "homehub-shopping-list";
const EXPORT_VERSION = 1;

type ShoppingListExport = {
  version: number;
  exportedAt: string;
  items: ShoppingItem[];
};

function isShoppingCategory(value: unknown): value is ShoppingCategory {
  return (
    typeof value === "string" &&
    (CATEGORY_ORDER as string[]).includes(value)
  );
}

function isShoppingItem(value: unknown): value is ShoppingItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ShoppingItem>;
  return (
    typeof item.id === "string" &&
    typeof item.label === "string" &&
    typeof item.checked === "boolean" &&
    isShoppingCategory(item.category) &&
    (item.emoji === undefined || typeof item.emoji === "string")
  );
}

function hydrateItem(item: ShoppingItem): ShoppingItem {
  return {
    ...item,
    emoji: item.emoji ?? productEmojiForLabel(item.label),
  };
}

export function loadShoppingItems(): ShoppingItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isShoppingItem)) return null;
    return parsed.map(hydrateItem);
  } catch {
    return null;
  }
}

export function saveShoppingItems(items: ShoppingItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function shoppingListToText(items: ShoppingItem[]): string {
  const date = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sort = (list: ShoppingItem[]) =>
    [...list].sort((a, b) => {
      const cat =
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      if (cat !== 0) return cat;
      return a.label.localeCompare(b.label, "fr");
    });

  const toBuy = sort(items.filter((item) => !item.checked));
  const done = sort(items.filter((item) => item.checked));

  const lines = [`Liste de courses — ${date}`, ""];

  if (toBuy.length > 0) {
    lines.push("À acheter :");
    for (const item of toBuy) lines.push(`- ${item.label}`);
  }

  if (done.length > 0) {
    if (toBuy.length > 0) lines.push("");
    lines.push("Déjà pris :");
    for (const item of done) lines.push(`- ${item.label}`);
  }

  if (toBuy.length === 0 && done.length === 0) {
    lines.push("Liste vide.");
  }

  return lines.join("\n");
}

export function shoppingListToJson(items: ShoppingItem[]): string {
  const payload: ShoppingListExport = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    items,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseShoppingListJson(raw: string): ShoppingItem[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every(isShoppingItem)) {
      return parsed.map(hydrateItem);
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as ShoppingListExport).items) &&
      (parsed as ShoppingListExport).items.every(isShoppingItem)
    ) {
      return (parsed as ShoppingListExport).items.map(hydrateItem);
    }

    return null;
  } catch {
    return null;
  }
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportFilename(extension: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `liste-courses-${stamp}.${extension}`;
}

export function exportShoppingListText(items: ShoppingItem[]): void {
  downloadFile(
    exportFilename("txt"),
    shoppingListToText(items),
    "text/plain;charset=utf-8"
  );
}

export function exportShoppingListJson(items: ShoppingItem[]): void {
  downloadFile(
    exportFilename("json"),
    shoppingListToJson(items),
    "application/json;charset=utf-8"
  );
}
