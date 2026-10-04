import {
  isServerlessRuntime,
  readJsonFile,
  readUuidCookie,
  writeJsonFile,
  writeUuidCookie,
} from "./storage";

const STORE_FILE = "ed-credentials.json";

export type EdCredentials = {
  username: string;
  password: string;
  studentName?: string;
  /** Couple double-auth (réutilisable) */
  cn?: string;
  cv?: string;
  uuid?: string;
};

export async function readStoredCredentials(): Promise<EdCredentials | null> {
  const parsed = await readJsonFile<Partial<EdCredentials>>(STORE_FILE);
  if (!parsed) return null;
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
}

function cleanEnv(value?: string | null): string {
  return (value ?? "").replace(/^\uFEFF/, "").trim();
}

export async function writeStoredCredentials(
  creds: EdCredentials
): Promise<void> {
  if (creds.uuid?.trim()) {
    await writeUuidCookie(creds.uuid.trim());
  }

  // Sur Vercel : identifiants = env ; ne jamais planter sur FS lecture seule
  if (isServerlessRuntime()) {
    return;
  }

  const previous = (await readStoredCredentials()) ?? {
    username: "",
    password: "",
  };

  const clearFa = "cn" in creds && !creds.cn;

  await writeJsonFile(STORE_FILE, {
    username: creds.username.trim() || previous.username,
    password: creds.password.trim() || previous.password,
    studentName:
      creds.studentName?.trim() || previous.studentName || "Maelle",
    cn: clearFa ? undefined : creds.cn?.trim() || previous.cn || undefined,
    cv: clearFa ? undefined : creds.cv?.trim() || previous.cv || undefined,
    uuid: creds.uuid?.trim() || previous.uuid || undefined,
  });
}

export async function resolveCredentials(options?: {
  cookieCn?: string;
  cookieCv?: string;
  cookieUuid?: string;
}): Promise<EdCredentials | null> {
  const username = cleanEnv(process.env.ED_USERNAME);
  const password = cleanEnv(process.env.ED_PASSWORD);
  const stored = await readStoredCredentials();
  const cookieUuid =
    options?.cookieUuid || (await readUuidCookie());

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
      uuid:
        cleanEnv(process.env.ED_UUID) || cookieUuid || stored?.uuid,
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
