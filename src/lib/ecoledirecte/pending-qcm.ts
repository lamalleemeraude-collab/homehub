import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import type { EdCredentials } from "./credentials";
import type { EdQcmChallenge } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_PATH = path.join(DATA_DIR, "ed-pending-qcm.json");
const TMP_PATH = path.join(tmpdir(), "homehub-ed-pending-qcm.json");

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

/** Payload envoyé au client (sans mot de passe) pour reprendre le QCM sur Vercel. */
export type QcmResumePayload = {
  v: 1;
  createdAt: number;
  uuid?: string;
  studentName?: string;
  challenge: EdQcmChallenge;
  session: PendingQcmStore["session"];
};

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function paths(): string[] {
  return isServerless() ? [TMP_PATH] : [LOCAL_PATH, TMP_PATH];
}

function isRoFsError(error: unknown): boolean {
  const err = error as NodeJS.ErrnoException;
  return (
    err?.code === "EROFS" ||
    err?.code === "EACCES" ||
    err?.code === "EPERM" ||
    (typeof err?.message === "string" &&
      err.message.toLowerCase().includes("read-only file system"))
  );
}

export function encodeQcmResume(
  data: Omit<QcmResumePayload, "v">
): string {
  const payload: QcmResumePayload = { v: 1, ...data };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeQcmResume(raw: string): QcmResumePayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as QcmResumePayload;
    if (parsed?.v !== 1 || !parsed.challenge || !parsed.session) return null;
    if (Date.now() - parsed.createdAt > 10 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function resumeFromPending(pending: PendingQcmStore): string {
  return encodeQcmResume({
    createdAt: pending.createdAt,
    uuid: pending.creds.uuid,
    studentName: pending.creds.studentName,
    challenge: pending.challenge,
    session: pending.session,
  });
}

export async function savePendingQcm(data: PendingQcmStore): Promise<void> {
  for (const filePath of paths()) {
    try {
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify(data), "utf8");
      return;
    } catch (error) {
      if (isRoFsError(error) || isServerless()) continue;
      throw error;
    }
  }
  // Serverless : le client porte le resume — pas bloquant
}

export async function readPendingQcm(): Promise<PendingQcmStore | null> {
  for (const filePath of paths()) {
    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as PendingQcmStore;
      if (!parsed?.challenge || Date.now() - parsed.createdAt > 10 * 60 * 1000) {
        await clearPendingQcm();
        return null;
      }
      return parsed;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function clearPendingQcm(): Promise<void> {
  for (const filePath of paths()) {
    try {
      await unlink(filePath);
    } catch {
      /* ignore */
    }
  }
}
