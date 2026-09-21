import type { SavedChefMeal } from "./chef-types";

const PANTRY_KEY = "homehub-pantry";
const LAST_RECIPE_KEY = "homehub-chef-last-meal";

const DEFAULT_PANTRY = [
  "Œufs",
  "Lait",
  "Beurre",
  "Fromage",
  "Pâtes",
  "Riz",
  "Oignons",
  "Ail",
  "Tomates",
  "Salade",
];

export function loadPantry(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_PANTRY];

  try {
    const raw = localStorage.getItem(PANTRY_KEY);
    if (!raw) {
      savePantry(DEFAULT_PANTRY);
      return [...DEFAULT_PANTRY];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === "string")) {
      return [...DEFAULT_PANTRY];
    }
    return parsed;
  } catch {
    return [...DEFAULT_PANTRY];
  }
}

export function savePantry(items: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
}

export function addPantryItem(label: string): string[] {
  const trimmed = label.trim();
  if (!trimmed) return loadPantry();
  const current = loadPantry();
  if (current.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
    return current;
  }
  const next = [...current, trimmed];
  savePantry(next);
  return next;
}

export function removePantryItem(label: string): string[] {
  const next = loadPantry().filter(
    (i) => i.toLowerCase() !== label.toLowerCase()
  );
  savePantry(next);
  return next;
}

export function saveLastChefMeal(meal: SavedChefMeal): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_RECIPE_KEY, JSON.stringify(meal));
}

export function loadLastChefMeal(): SavedChefMeal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_RECIPE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedChefMeal;
  } catch {
    return null;
  }
}
