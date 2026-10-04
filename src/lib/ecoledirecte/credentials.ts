import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  readUuidFromCookie,
  setUuidCookie,
} from "./uuid-cookie";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "ed-credentials.json");

export type EdCredentials = {
  username: string;
  password: string;
  studentName?: string;
  /** Couple double-auth (réutilisable) */
  cn?: string;
  cv?: string;
  uuid?: string;
};

/** Vercel / Lambda : FS lecture seule — pas de data/*.json. */
export function usesFileCredentialStore(): boolean {
  return !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME;
}

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readStoredCredentials(): Promise<EdCredentials | null> {
  if (!usesFileCredentialStore()) return null;
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

function cleanEnv(value?: string | null): string {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

/**
 * Persiste ce qui est possible :
 * - local : fichier data/ed-credentials.json
 * - Vercel : uuid en cookie ; cn/cv via fa-cookie (réponse API) ; login via env
 */
export async function writeStoredCredentials(
  creds: EdCredentials
): Promise<void> {
  if (creds.uuid?.trim()) {
    await setUuidCookie(creds.uuid.trim());
  }

  if (!usesFileCredentialStore()) {
    return;
  }

  try {
    await ensureDataDir();
    const previous = (await readStoredCredentials()) ?? {
      username: "",
      password: "",
    };

    // `cn: undefined` / `cv: undefined` = effacer explicitement (FA périmé)
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
    if (err.code === "EROFS" || err.code === "EACCES") {
      console.warn(
        "[ecoledirecte] FS non inscriptible — uuid/FA via cookies, login via env."
      );
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
  const cookieUuid = await readUuidFromCookie();

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
