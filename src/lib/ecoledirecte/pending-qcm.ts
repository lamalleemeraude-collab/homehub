import type { EdCredentials } from "./credentials";
import type { EdQcmChallenge } from "./types";
import {
  clearPendingCookie,
  deleteJsonFile,
  readJsonFile,
  readPendingCookie,
  writeJsonFile,
  writePendingCookie,
} from "./storage";

const STORE_FILE = "ed-pending-qcm.json";

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

function isFresh(parsed: PendingQcmStore): boolean {
  return Boolean(
    parsed?.challenge && Date.now() - parsed.createdAt <= 10 * 60 * 1000
  );
}

/** Compacte le payload pour tenir dans un cookie (~4 Ko). */
function compactPending(data: PendingQcmStore): PendingQcmStore {
  // Si le mot de passe est déjà en env Vercel, ne pas le dupliquer dans le cookie
  const envPassword = Boolean(process.env.ED_PASSWORD?.trim());
  return {
    createdAt: data.createdAt,
    creds: {
      username: data.creds.username,
      password: envPassword ? "" : data.creds.password,
      studentName: data.creds.studentName,
      uuid: data.creds.uuid,
      cn: data.creds.cn,
      cv: data.creds.cv,
    },
    challenge: {
      question: data.challenge.question,
      propositions: data.challenge.propositions,
      propositionValues: data.challenge.propositionValues,
      token: data.challenge.token,
      twoFaToken: data.challenge.twoFaToken,
    },
    session: {
      cookies: data.session.cookies,
      gtk: data.session.gtk,
      token: data.session.token,
      twoFaToken: data.session.twoFaToken,
    },
  };
}

export async function savePendingQcm(data: PendingQcmStore): Promise<void> {
  const compact = compactPending(data);
  const okCookie = await writePendingCookie(compact);
  // Fichier local /tmp en secours (dev + même instance)
  await writeJsonFile(STORE_FILE, compact);
  if (!okCookie) {
    console.warn(
      "[ed] pending QCM trop volumineux pour cookie — stockage fichier seul"
    );
  }
}

export async function readPendingQcm(): Promise<PendingQcmStore | null> {
  const fromCookie = await readPendingCookie<PendingQcmStore>();
  if (fromCookie && isFresh(fromCookie)) return fromCookie;
  if (fromCookie) await clearPendingQcm();

  const fromFile = await readJsonFile<PendingQcmStore>(STORE_FILE);
  if (fromFile && isFresh(fromFile)) return fromFile;
  if (fromFile) await clearPendingQcm();

  return null;
}

export async function clearPendingQcm(): Promise<void> {
  await clearPendingCookie();
  await deleteJsonFile(STORE_FILE);
}
