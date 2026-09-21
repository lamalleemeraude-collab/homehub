import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { IPhoneSyncEvent, IPhoneSyncStore } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "iphone-events.json");

const EMPTY_STORE: IPhoneSyncStore = {
  syncedAt: "",
  events: [],
};

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readIphoneSyncStore(): Promise<IPhoneSyncStore> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<IPhoneSyncStore>;
    if (!parsed || !Array.isArray(parsed.events)) return { ...EMPTY_STORE };

    return {
      syncedAt: parsed.syncedAt ?? "",
      events: parsed.events as IPhoneSyncEvent[],
    };
  } catch {
    return { ...EMPTY_STORE };
  }
}

export async function writeIphoneSyncStore(
  events: IPhoneSyncEvent[]
): Promise<IPhoneSyncStore> {
  await ensureDataDir();
  const store: IPhoneSyncStore = {
    syncedAt: new Date().toISOString(),
    events,
  };
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  return store;
}
