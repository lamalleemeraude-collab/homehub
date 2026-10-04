import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "ed-credentials.json");
const UUID_COOKIE = "ed_device_uuid";

export type EdCredentials = {
  username: string;
  password: string;
  studentName?: string;
  /** Couple double-auth (réutilisable) */
  cn?: string;
  cv?: string;
  uuid?: string;
};

/** Vercel / Lambda : FS en lecture seule (sauf /tmp). */
export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.VERCEL_ENV
  );
}

function cleanEnv(value?: string | null): string {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readUuidCookie(): Promise<string | undefined> {
  try {
    const jar = await cookies();
    return jar.get(UUID_COOKIE)?.value?.trim() || undefined;
  } catch {
    return undefined;
  }
}

async function writeUuidCookie(uuid: string): Promise<void> {
  try {
    const jar = await cookies();
    jar.set(UUID_COOKIE, uuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch {
    // hors contexte request
  }
}

export async function readStoredCredentials(): Promise<EdCredentials | null> {
  if (isServerlessRuntime()) return null;
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<EdCredentials>;
    const username = parsed.username?.trim() ?? "";
    const password = parsed.password?.trim() ?? "";
    if (!username || !password) return null;
    return {
      username,
      password,
      studentName: parsed.studentName?.trim() || undefined,
      cn: parsed.cn?.trim() || undefined,
      cv: parsed.cv?.trim() || undefined,
      uuid: parsed.uuid?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Persiste uuid / FA localement (fichier).
 * Sur Vercel : uuid → cookie ; mot de passe uniquement via env (jamais de fichier).
 */
export async function writeStoredCredentials(
  creds: EdCredentials
): Promise<void> {
  if (creds.uuid?.trim()) {
    await writeUuidCookie(creds.uuid.trim());
  }

  if (isServerlessRuntime()) {
    // Prod : ED_USERNAME / ED_PASSWORD + cookies FA / uuid — pas de FS.
    return;
  }

  try {
    await ensureDataDir();
    const previous = (await readStoredCredentials()) ?? {
      username: "",
      password: "",
    };

    const clearFa = "cn" in creds && !creds.cn;

    await writeFile(
      STORE_PATH,
      JSON.stringify(
        {
          username: creds.username.trim() || previous.username,
          password: creds.password.trim() || previous.password,
          studentName:
            creds.studentName?.trim() || previous.studentName || "Maelle",
          cn: clearFa ? undefined : creds.cn?.trim() || previous.cn || undefined,
          cv: clearFa ? undefined : creds.cv?.trim() || previous.cv || undefined,
          uuid: creds.uuid?.trim() || previous.uuid || undefined,
        },
        null,
        2
      ),
      "utf8"
    );
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "EROFS" || err?.code === "EACCES") {
      // Fallback serverless / FS bloqué
      return;
    }
    throw error;
  }
}

export async function resolveCredentials(options?: {
  cookieCn?: string;
  cookieCv?: string;
}): Promise<EdCredentials | null> {
  const username = cleanEnv(process.env.ED_USERNAME);
  const password = cleanEnv(process.env.ED_PASSWORD);
  const stored = await readStoredCredentials();
  const cookieUuid = await readUuidCookie();

  const cn =
    options?.cookieCn || cleanEnv(process.env.ED_CN) || stored?.cn;
  const cv =
    options?.cookieCv || cleanEnv(process.env.ED_CV) || stored?.cv;

  if (username && password) {
    return {
      username,
      password,
      studentName:
        cleanEnv(process.env.ED_STUDENT_NAME) ||
        stored?.studentName ||
        "Maelle",
      cn,
      cv,
      uuid: cleanEnv(process.env.ED_UUID) || cookieUuid || stored?.uuid,
    };
  }

  if (!stored) return null;
  return {
    ...stored,
    cn: options?.cookieCn || stored.cn,
    cv: options?.cookieCv || stored.cv,
    uuid: cookieUuid || stored.uuid,
  };
}
