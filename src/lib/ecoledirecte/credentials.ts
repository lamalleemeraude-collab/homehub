import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  edStoreDir,
  isReadonlyFsError,
  isServerlessRuntime,
} from "./runtime-fs";

const STORE_PATH = () => path.join(edStoreDir(), "ed-credentials.json");

export type EdCredentials = {
  username: string;
  password: string;
  studentName?: string;
  /** Couple double-auth (réutilisable) */
  cn?: string;
  cv?: string;
  uuid?: string;
};

function cleanEnv(value?: string | null): string {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

async function ensureStoreDir(): Promise<void> {
  await mkdir(edStoreDir(), { recursive: true });
}

export async function readStoredCredentials(): Promise<EdCredentials | null> {
  try {
    const raw = await readFile(STORE_PATH(), "utf8");
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
 * Persistance locale / best-effort.
 * Sur Vercel : écrit dans `/tmp` si possible, sinon no-op (jamais d’EROFS).
 * Identifiants prod = variables d’env ; uuid/FA = cookies.
 */
export async function writeStoredCredentials(
  creds: EdCredentials
): Promise<void> {
  try {
    await ensureStoreDir();
    const previous = (await readStoredCredentials()) ?? {
      username: "",
      password: "",
    };

    const clearFa = "cn" in creds && !creds.cn;

    // Sur serverless, ne jamais écrire le mot de passe dans /tmp
    const username = isServerlessRuntime()
      ? previous.username || creds.username.trim()
      : creds.username.trim() || previous.username;
    const password = isServerlessRuntime()
      ? previous.password || ""
      : creds.password.trim() || previous.password;

    await writeFile(
      STORE_PATH(),
      JSON.stringify(
        {
          username,
          password,
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
    if (isReadonlyFsError(error) || isServerlessRuntime()) {
      return;
    }
    throw error;
  }
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

  if (!stored?.username || !stored?.password) return null;
  return {
    ...stored,
    cn: options?.cookieCn || stored.cn,
    cv: options?.cookieCv || stored.cv,
    uuid: options?.cookieUuid || stored.uuid,
  };
}
