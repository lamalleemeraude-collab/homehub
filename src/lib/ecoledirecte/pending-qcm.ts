import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { gunzipSync, gzipSync } from "zlib";
import { cookies } from "next/headers";
import { isServerlessRuntime, type EdCredentials } from "./credentials";
import type { EdQcmChallenge } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "ed-pending-qcm.json");
const COOKIE_NAME = "ed_pending_qcm";
/** Cookies max ~4KB — on découpe si besoin. */
const COOKIE_CHUNK = "ed_pq_";
const MAX_CHUNK = 3500;

export type PendingQcmStore = {
  /** Sans mot de passe en cookie (repris via env / fichier). */
  creds: Omit<EdCredentials, "password"> & { password?: string };
  challenge: EdQcmChallenge;
  session: {
    cookies: Record<string, string>;
    gtk?: string;
    token?: string;
    twoFaToken?: string;
  };
  createdAt: number;
};

function pack(data: PendingQcmStore): string {
  const slim: PendingQcmStore = {
    ...data,
    creds: {
      username: data.creds.username,
      studentName: data.creds.studentName,
      cn: data.creds.cn,
      cv: data.creds.cv,
      uuid: data.creds.uuid,
      // jamais le password dans le cookie
    },
  };
  return gzipSync(Buffer.from(JSON.stringify(slim), "utf8")).toString(
    "base64url"
  );
}

function unpack(raw: string): PendingQcmStore {
  const json = gunzipSync(Buffer.from(raw, "base64url")).toString("utf8");
  return JSON.parse(json) as PendingQcmStore;
}

async function clearCookiePending(): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
    for (let i = 0; i < 8; i++) {
      jar.set(`${COOKIE_CHUNK}${i}`, "", { path: "/", maxAge: 0 });
    }
  } catch {
    /* ignore */
  }
}

async function writeCookiePending(encoded: string): Promise<void> {
  const jar = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };

  await clearCookiePending();

  if (encoded.length <= MAX_CHUNK) {
    jar.set(COOKIE_NAME, encoded, opts);
    return;
  }

  const chunks = Math.ceil(encoded.length / MAX_CHUNK);
  jar.set(COOKIE_NAME, `chunks:${chunks}`, opts);
  for (let i = 0; i < chunks; i++) {
    jar.set(
      `${COOKIE_CHUNK}${i}`,
      encoded.slice(i * MAX_CHUNK, (i + 1) * MAX_CHUNK),
      opts
    );
  }
}

async function readCookiePending(): Promise<PendingQcmStore | null> {
  try {
    const jar = await cookies();
    const head = jar.get(COOKIE_NAME)?.value;
    if (!head) return null;

    let encoded = head;
    if (head.startsWith("chunks:")) {
      const n = Number(head.slice("chunks:".length));
      if (!Number.isFinite(n) || n < 1 || n > 8) return null;
      const parts: string[] = [];
      for (let i = 0; i < n; i++) {
        const part = jar.get(`${COOKIE_CHUNK}${i}`)?.value;
        if (!part) return null;
        parts.push(part);
      }
      encoded = parts.join("");
    }

    const parsed = unpack(encoded);
    if (!parsed?.challenge || Date.now() - parsed.createdAt > 10 * 60 * 1000) {
      await clearCookiePending();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function savePendingQcm(data: PendingQcmStore): Promise<void> {
  if (isServerlessRuntime()) {
    await writeCookiePending(pack(data));
    return;
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(STORE_PATH, JSON.stringify(data), "utf8");
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "EROFS" || err?.code === "EACCES") {
      await writeCookiePending(pack(data));
      return;
    }
    throw error;
  }
}

export async function readPendingQcm(): Promise<PendingQcmStore | null> {
  if (isServerlessRuntime()) {
    return readCookiePending();
  }

  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as PendingQcmStore;
    if (!parsed?.challenge || Date.now() - parsed.createdAt > 10 * 60 * 1000) {
      await clearPendingQcm();
      return null;
    }
    return parsed;
  } catch {
    // fichier absent → cookie (ex. FS déjà bloqué)
    return readCookiePending();
  }
}

export async function clearPendingQcm(): Promise<void> {
  await clearCookiePending();
  if (isServerlessRuntime()) return;
  try {
    await unlink(STORE_PATH);
  } catch {
    // ignore
  }
}
