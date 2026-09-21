import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { FavoriteMenu, MenuIdea } from "./menu-idea-types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "favorite-menus.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readFavoriteMenus(): Promise<FavoriteMenu[]> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
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

async function writeFavoriteMenus(menus: FavoriteMenu[]): Promise<void> {
  await ensureDataDir();
  await writeFile(STORE_PATH, JSON.stringify(menus, null, 2), "utf8");
}

export async function addFavoriteMenu(idea: MenuIdea): Promise<FavoriteMenu[]> {
  const current = await readFavoriteMenus();
  const without = current.filter((m) => m.id !== idea.id && m.title !== idea.title);
  const favorite: FavoriteMenu = {
    ...idea,
    favoritedAt: new Date().toISOString(),
  };
  const next = [favorite, ...without];
  await writeFavoriteMenus(next);
  return next;
}

export async function removeFavoriteMenu(id: string): Promise<FavoriteMenu[]> {
  const current = await readFavoriteMenus();
  const next = current.filter((m) => m.id !== id);
  await writeFavoriteMenus(next);
  return next;
}
