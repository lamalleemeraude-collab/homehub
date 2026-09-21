/** Favoris repas — localStorage (tablette / cloud). Sync API optionnelle. */

import type { FavoriteMenu, MenuIdea } from "./menu-idea-types";

const STORAGE_KEY = "homehub-favorite-menus";

export function loadFavoriteMenusLocal(): FavoriteMenu[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FavoriteMenu =>
        !!item &&
        typeof item === "object" &&
        typeof (item as FavoriteMenu).id === "string" &&
        typeof (item as FavoriteMenu).title === "string"
    );
  } catch {
    return [];
  }
}

export function saveFavoriteMenusLocal(menus: FavoriteMenu[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
}

export function addFavoriteLocal(idea: MenuIdea): FavoriteMenu[] {
  const current = loadFavoriteMenusLocal();
  const without = current.filter((m) => m.id !== idea.id && m.title !== idea.title);
  const next = [
    { ...idea, favoritedAt: new Date().toISOString() },
    ...without,
  ];
  saveFavoriteMenusLocal(next);
  return next;
}

export function removeFavoriteLocal(id: string): FavoriteMenu[] {
  const next = loadFavoriteMenusLocal().filter((m) => m.id !== id);
  saveFavoriteMenusLocal(next);
  return next;
}
