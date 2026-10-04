import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "ed-credentials.json");
/** Sur Vercel, seul /tmp est writable (éphémère). */
const TMP_STORE_PATH = path.join(tmpdir(), "homehub-ed-credentials.json");

export type EdCredentials = {
  username: string;
  password: string;
  studentName?: string;
  /** Couple double-auth (réutilisable) */
  cn?: string;
  cv?: string;
  uuid?: string;
};

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function storePaths(): string[] {
  // Local : data/ d’abord. Serverless : /tmp uniquement.
  return isServerless() ? [TMP_STORE_PATH] : [STORE_PATH, TMP_STORE_PATH];
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

async function readFromPath(filePath: string): Promise<EdCredentials | null> {
  try {
    const raw = await readFile(filePath, "utf8");
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

export async function readStoredCredentials(): Promise<EdCredentials | null> {
  for (const filePath of storePaths()) {
    const creds = await readFromPath(filePath);
    if (creds) return creds;
  }
  return null;
}

function cleanEnv(value?: string | null): string {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

async function writeToPath(
  filePath: string,
  payload: Record<string, unknown>
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

/**
 * Persiste uuid / FA / password en local.
 * Sur Vercel : tente /tmp, ne jamais throw (env + cookies = source de vérité).
 */
export async function writeStoredCredentials(
  creds: EdCredentials
): Promise<void> {
  const previous = (await readStoredCredentials()) ?? {
    username: "",
    password: "",
  };

  // `cn: undefined` / `cv: undefined` = effacer explicitement (FA périmé)
  const clearFa = "cn" in creds && !creds.cn;

  const payload = {
    username: creds.username.trim() || previous.username,
    password: creds.password.trim() || previous.password,
    studentName:
      creds.studentName?.trim() || previous.studentName || "Maelle",
    cn: clearFa ? undefined : creds.cn?.trim() || previous.cn || undefined,
    cv: clearFa ? undefined : creds.cv?.trim() || previous.cv || undefined,
    uuid: creds.uuid?.trim() || previous.uuid || undefined,
  };

  let lastError: unknown;
  for (const filePath of storePaths()) {
    try {
      await writeToPath(filePath, payload);
      return;
    } catch (error) {
      lastError = error;
      if (isRoFsError(error)) continue;
    }
  }

  // Serverless / FS read-only : ignore (cookies + env portent le reste)
  if (isServerless() || isRoFsError(lastError)) return;
  throw lastError;
}

export async function resolveCredentials(options?: {
  cookieCn?: string;
  cookieCv?: string;
  cookieUuid?: string;
}): Promise<EdCredentials | null> {
  const username = cleanEnv(process.env.ED_USERNAME);
  const password = cleanEnv(process.env.ED_PASSWORD);
  const stored = await readStoredCredentials();

  const cn =
    options?.cookieCn || cleanEnv(process.env.ED_CN) || stored?.cn;
  const cv =
    options?.cookieCv || cleanEnv(process.env.ED_CV) || stored?.cv;
  const uuid =
    options?.cookieUuid ||
    cleanEnv(process.env.ED_UUID) ||
    stored?.uuid;

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
      uuid,
    };
  }

  if (!stored) return null;
  return {
    ...stored,
    cn: options?.cookieCn || stored.cn,
    cv: options?.cookieCv || stored.cv,
    uuid: options?.cookieUuid || stored.uuid,
  };
}

/** true si ED_USERNAME / ED_PASSWORD sont définis (prod Vercel). */
export function hasEnvCredentials(): boolean {
  return Boolean(cleanEnv(process.env.ED_USERNAME) && cleanEnv(process.env.ED_PASSWORD));
}
