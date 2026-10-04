import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { cookies } from "next/headers";

/** Vercel / Lambda : FS app en lecture seule ; `/tmp` + cookies seulement. */
export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL_ENV
  );
}

function dataDir(): string {
  if (isServerlessRuntime()) {
    return path.join(tmpdir(), "homehub-ed");
  }
  return path.join(process.cwd(), "data");
}

export async function readJsonFile<T>(filename: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(dataDir(), filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile(
  filename: string,
  data: unknown
): Promise<void> {
  const dir = dataDir();
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), JSON.stringify(data), "utf8");
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "EROFS" || err.code === "EACCES" || isServerlessRuntime()) {
      // Prod serverless : pas de persistance fichier durable
      return;
    }
    throw error;
  }
}

export async function deleteJsonFile(filename: string): Promise<void> {
  try {
    await unlink(path.join(dataDir(), filename));
  } catch {
    /* ignore */
  }
}

const COOKIE_UUID = "ed_uuid";
const COOKIE_PENDING = "ed_pending_qcm";
const MAX_COOKIE = 3500;

export async function readUuidCookie(): Promise<string | undefined> {
  try {
    const jar = await cookies();
    const v = jar.get(COOKIE_UUID)?.value?.trim();
    return v || undefined;
  } catch {
    return undefined;
  }
}

export async function writeUuidCookie(uuid: string): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(COOKIE_UUID, uuid, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
  } catch {
    /* hors contexte request */
  }
}

function encodeCookiePayload(data: unknown): string | null {
  const json = JSON.stringify(data);
  const b64 = Buffer.from(json, "utf8").toString("base64url");
  if (b64.length <= MAX_COOKIE) return b64;
  return null;
}

function decodeCookiePayload<T>(raw: string): T | null {
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export async function writePendingCookie(data: unknown): Promise<boolean> {
  const encoded = encodeCookiePayload(data);
  if (!encoded) return false;
  try {
    const jar = await cookies();
    jar.set(COOKIE_PENDING, encoded, {
      path: "/",
      maxAge: 60 * 10,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });
    return true;
  } catch {
    return false;
  }
}

export async function readPendingCookie<T>(): Promise<T | null> {
  try {
    const jar = await cookies();
    const raw = jar.get(COOKIE_PENDING)?.value;
    if (!raw) return null;
    return decodeCookiePayload<T>(raw);
  } catch {
    return null;
  }
}

export async function clearPendingCookie(): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(COOKIE_PENDING, "", { path: "/", maxAge: 0 });
  } catch {
    /* ignore */
  }
}
