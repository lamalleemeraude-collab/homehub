import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import {
  resolveCredentials,
  usesFileCredentialStore,
  type EdCredentials,
} from "./credentials";
import type { EdQcmChallenge } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "ed-pending-qcm.json");
const COOKIE = "ed_pending_qcm";

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

/** Cookie : pas de mot de passe (rechargé via env/fichier à la lecture). */
type PendingQcmSlim = {
  challenge: EdQcmChallenge;
  session: PendingQcmStore["session"];
  createdAt: number;
  studentName?: string;
};

function isExpired(createdAt: number): boolean {
  return Date.now() - createdAt > 10 * 60 * 1000;
}

async function savePendingFile(data: PendingQcmStore): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data), "utf8");
}

async function readPendingFile(): Promise<PendingQcmStore | null> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as PendingQcmStore;
    if (!parsed?.challenge || isExpired(parsed.createdAt)) {
      await clearPendingFile();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function clearPendingFile(): Promise<void> {
  try {
    await unlink(STORE_PATH);
  } catch {
    /* ignore */
  }
}

async function savePendingCookie(data: PendingQcmStore): Promise<void> {
  const slim: PendingQcmSlim = {
    challenge: data.challenge,
    session: data.session,
    createdAt: data.createdAt,
    studentName: data.creds.studentName,
  };
  const value = Buffer.from(JSON.stringify(slim), "utf8").toString("base64url");
  const jar = await cookies();
  jar.set(COOKIE, value, {
    path: "/",
    maxAge: 10 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
}

async function readPendingCookie(): Promise<PendingQcmStore | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE)?.value;
    if (!raw) return null;
    const slim = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as PendingQcmSlim;
    if (!slim?.challenge || isExpired(slim.createdAt)) {
      await clearPendingCookie();
      return null;
    }
    const creds = await resolveCredentials();
    if (!creds) {
      await clearPendingCookie();
      return null;
    }
    return {
      challenge: slim.challenge,
      session: slim.session,
      createdAt: slim.createdAt,
      creds: {
        ...creds,
        studentName: slim.studentName || creds.studentName,
      },
    };
  } catch {
    return null;
  }
}

async function clearPendingCookie(): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(COOKIE, "", { path: "/", maxAge: 0 });
  } catch {
    /* ignore */
  }
}

export async function savePendingQcm(data: PendingQcmStore): Promise<void> {
  if (usesFileCredentialStore()) {
    try {
      await savePendingFile(data);
      return;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== "EROFS" && err.code !== "EACCES") throw error;
    }
  }
  await savePendingCookie(data);
}

export async function readPendingQcm(): Promise<PendingQcmStore | null> {
  if (usesFileCredentialStore()) {
    const fromFile = await readPendingFile();
    if (fromFile) return fromFile;
  }
  return readPendingCookie();
}

export async function clearPendingQcm(): Promise<void> {
  if (usesFileCredentialStore()) {
    await clearPendingFile();
  }
  await clearPendingCookie();
}
