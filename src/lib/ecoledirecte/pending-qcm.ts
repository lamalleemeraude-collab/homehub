import { deflateSync, inflateSync } from "zlib";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import type { EdCredentials } from "./credentials";
import type { EdQcmChallenge } from "./types";
import {
  edStoreDir,
  isReadonlyFsError,
  isServerlessRuntime,
} from "./runtime-fs";

const FILE_PATH = () => path.join(edStoreDir(), "ed-pending-qcm.json");
const COOKIE_NAME = "ed_qcm";
const MAX_COOKIE = 3500;

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

/** Payload cookie sans mot de passe (repris depuis l’env au restore). */
type SlimPending = {
  challenge: EdQcmChallenge;
  session: PendingQcmStore["session"];
  createdAt: number;
  username: string;
  studentName?: string;
  uuid?: string;
  cn?: string;
  cv?: string;
};

function encodeSlim(data: PendingQcmStore): string {
  const slim: SlimPending = {
    challenge: data.challenge,
    session: data.session,
    createdAt: data.createdAt,
    username: data.creds.username,
    studentName: data.creds.studentName,
    uuid: data.creds.uuid,
    cn: data.creds.cn,
    cv: data.creds.cv,
  };
  return deflateSync(Buffer.from(JSON.stringify(slim), "utf8")).toString(
    "base64url"
  );
}

function decodeSlim(encoded: string): SlimPending | null {
  try {
    const json = inflateSync(
      Buffer.from(encoded, "base64url")
    ).toString("utf8");
    return JSON.parse(json) as SlimPending;
  } catch {
    return null;
  }
}

async function hydrateFromSlim(slim: SlimPending): Promise<PendingQcmStore | null> {
  if (!slim?.challenge || Date.now() - slim.createdAt > 10 * 60 * 1000) {
    return null;
  }
  const { resolveCredentials } = await import("./credentials");
  const creds = await resolveCredentials({
    cookieCn: slim.cn,
    cookieCv: slim.cv,
    cookieUuid: slim.uuid,
  });
  if (!creds) return null;
  return {
    challenge: slim.challenge,
    session: slim.session,
    createdAt: slim.createdAt,
    creds: {
      ...creds,
      username: slim.username || creds.username,
      studentName: slim.studentName || creds.studentName,
      uuid: slim.uuid || creds.uuid,
      cn: slim.cn || creds.cn,
      cv: slim.cv || creds.cv,
    },
  };
}

async function saveCookie(data: PendingQcmStore): Promise<boolean> {
  try {
    const encoded = encodeSlim(data);
    if (encoded.length > MAX_COOKIE) return false;
    const jar = await cookies();
    jar.set(COOKIE_NAME, encoded, {
      path: "/",
      maxAge: 10 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
    return true;
  } catch {
    return false;
  }
}

async function readCookie(): Promise<PendingQcmStore | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE_NAME)?.value;
    if (!raw) return null;
    const slim = decodeSlim(raw);
    if (!slim) return null;
    const pending = await hydrateFromSlim(slim);
    if (!pending) {
      await clearPendingQcm();
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

async function clearCookie(): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  } catch {
    /* hors requête */
  }
}

async function saveFile(data: PendingQcmStore): Promise<void> {
  await mkdir(edStoreDir(), { recursive: true });
  await writeFile(FILE_PATH(), JSON.stringify(data), "utf8");
}

async function readFileStore(): Promise<PendingQcmStore | null> {
  try {
    const raw = await readFile(FILE_PATH(), "utf8");
    const parsed = JSON.parse(raw) as PendingQcmStore;
    if (!parsed?.challenge || Date.now() - parsed.createdAt > 10 * 60 * 1000) {
      await clearFile();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function clearFile(): Promise<void> {
  try {
    await unlink(FILE_PATH());
  } catch {
    /* ignore */
  }
}

export async function savePendingQcm(data: PendingQcmStore): Promise<void> {
  if (isServerlessRuntime()) {
    const ok = await saveCookie(data);
    if (ok) return;
    // trop gros pour cookie → best-effort /tmp (même instance)
    try {
      await saveFile(data);
    } catch (error) {
      if (!isReadonlyFsError(error)) throw error;
    }
    return;
  }

  try {
    await saveFile(data);
  } catch (error) {
    if (isReadonlyFsError(error)) {
      await saveCookie(data);
      return;
    }
    throw error;
  }
}

export async function readPendingQcm(): Promise<PendingQcmStore | null> {
  if (isServerlessRuntime()) {
    return (await readCookie()) || (await readFileStore());
  }
  return (await readFileStore()) || (await readCookie());
}

export async function clearPendingQcm(): Promise<void> {
  await clearCookie();
  await clearFile();
}
