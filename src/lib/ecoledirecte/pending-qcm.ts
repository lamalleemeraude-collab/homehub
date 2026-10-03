import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import type { EdCredentials } from "./credentials";
import type { EdQcmChallenge } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "ed-pending-qcm.json");

export type PendingQcmStore = {
  creds: EdCredentials;
  challenge: EdQcmChallenge;
  session: {
    cookies: Record<string, string>;
    gtk?: string;
    token?: string;
    twoFaToken?: string;
  };
  createdAt: number;
};

export async function savePendingQcm(data: PendingQcmStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data), "utf8");
}

export async function readPendingQcm(): Promise<PendingQcmStore | null> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as PendingQcmStore;
    // expire après 10 min
    if (!parsed?.challenge || Date.now() - parsed.createdAt > 10 * 60 * 1000) {
      await clearPendingQcm();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function clearPendingQcm(): Promise<void> {
  try {
    await unlink(STORE_PATH);
  } catch {
    // ignore
  }
}
