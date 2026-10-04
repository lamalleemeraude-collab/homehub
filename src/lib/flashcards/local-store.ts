import type { FlashDeck } from "./types";

const KEY = "homehub-flash-decks-v1";

export function loadDecks(): FlashDeck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FlashDeck[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDeck(deck: FlashDeck): FlashDeck[] {
  const decks = loadDecks().filter((d) => d.id !== deck.id);
  const next = [deck, ...decks].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function deleteDeck(id: string): FlashDeck[] {
  const next = loadDecks().filter((d) => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
