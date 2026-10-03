/**
 * Client ÉcoleDirecte — flux économe en tentatives de login
 * (évite le blocage du compte).
 *
 * 1er passage : 1 login → éventuel QCM (session gardée)
 * Réponse QCM : 0 login supplémentaire pour répondre + 1 login final avec cn/cv
 * Ensuite : cn/cv mémorisés → en général 1 login suffit
 */

import { randomUUID } from "crypto";
import {
  resolveCredentials,
  writeStoredCredentials,
  type EdCredentials,
} from "./credentials";
import {
  clearPendingQcm,
  readPendingQcm,
  savePendingQcm,
} from "./pending-qcm";
import type { EdQcmChallenge, HomeworkItem } from "./types";

export type { EdQcmChallenge };

const ED_VERSION = process.env.ED_API_VERSION?.trim() || "4.101.4";
const ED_ROOT = "https://api.ecoledirecte.com/v3";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";

type EdAccount = {
  id: number;
  typeCompte?: string;
  nom?: string;
  prenom?: string;
  main?: boolean;
  profile?: {
    eleves?: Array<{ id: number; nom?: string; prenom?: string }>;
  };
};

type EdLoginData = {
  accounts?: EdAccount[];
  totp?: boolean;
};

type EdEnvelope<T> = {
  code: number;
  message?: string;
  token?: string;
  data?: T;
};

type UpcomingMap = Record<
  string,
  Array<{
    matiere?: string;
    codeMatiere?: string;
    idDevoir?: number;
    effectue?: boolean;
    interrogation?: boolean;
    donneLe?: string;
  }>
>;

type DayPage = {
  date?: string;
  matieres?: Array<{
    id?: number;
    matiere?: string;
    nomProf?: string;
    interrogation?: boolean;
    aFaire?: {
      idDevoir?: number;
      contenu?: string;
      effectue?: boolean;
      donneLe?: string;
    };
  }>;
};

type AuthSession = {
  cookies: Map<string, string>;
  gtk?: string;
  token?: string;
  twoFaToken?: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function decodeEdContent(raw?: string): string {
  if (!raw) return "";
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    if (decoded.includes("<") || decoded.includes("&")) {
      return stripHtml(decoded);
    }
    return decoded.trim();
  } catch {
    return stripHtml(raw);
  }
}

function decodeB64Text(raw: string): string {
  try {
    return Buffer.from(raw, "base64").toString("utf8");
  } catch {
    return raw;
  }
}

function sessionToJson(session: AuthSession) {
  return {
    cookies: Object.fromEntries(session.cookies),
    gtk: session.gtk,
    token: session.token,
    twoFaToken: session.twoFaToken,
  };
}

function sessionFromJson(raw: {
  cookies: Record<string, string>;
  gtk?: string;
  token?: string;
  twoFaToken?: string;
}): AuthSession {
  return {
    cookies: new Map(Object.entries(raw.cookies || {})),
    gtk: raw.gtk,
    token: raw.token,
    twoFaToken: raw.twoFaToken,
  };
}

function ingestCookies(session: AuthSession, headers: Headers): void {
  for (const line of headers.getSetCookie?.() ?? []) {
    const [pair] = line.split(";");
    const eq = pair.indexOf("=");
    if (eq < 1) continue;
    session.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  const gtkHeader = headers.get("X-GTK");
  if (gtkHeader) session.gtk = gtkHeader;
  const tokenHeader = headers.get("X-Token");
  if (tokenHeader) session.token = tokenHeader;
  const twoFa = headers.get("2FA-Token");
  if (twoFa) session.twoFaToken = twoFa;
}

function cookieHeader(session: AuthSession): string | undefined {
  if (session.cookies.size === 0) return undefined;
  return [...session.cookies.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function edRequest<T>(
  session: AuthSession,
  path: string,
  options: {
    body?: Record<string, unknown>;
    includeGtk?: boolean;
    includeToken?: boolean;
    includeTwoFa?: boolean;
  } = {}
): Promise<EdEnvelope<T>> {
  const includeGtk = options.includeGtk ?? true;
  const includeToken = options.includeToken ?? true;
  const includeTwoFa = options.includeTwoFa ?? true;

  const url = `${ED_ROOT}${path}${path.includes("?") ? "&" : "?"}v=${ED_VERSION}`;
  const headers: Record<string, string> = {
    accept: "application/json, text/plain, */*",
    "user-agent": UA,
    "content-type": "application/x-www-form-urlencoded",
    origin: "https://www.ecoledirecte.com",
    referer: "https://www.ecoledirecte.com/",
  };

  const cookie = cookieHeader(session);
  if (cookie) headers.Cookie = cookie;

  if (includeGtk) {
    const gtk = session.gtk || session.cookies.get("GTK");
    if (gtk) headers["X-GTK"] = gtk;
  }
  if (includeToken && session.token) headers["X-Token"] = session.token;
  if (includeTwoFa && session.twoFaToken) {
    headers["2FA-Token"] = session.twoFaToken;
  }

  const params = new URLSearchParams();
  params.set("data", JSON.stringify(options.body ?? {}));

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: params.toString(),
    cache: "no-store",
    redirect: "manual",
  });

  ingestCookies(session, res.headers);
  const json = (await res.json()) as EdEnvelope<T>;
  if (json.token) session.token = json.token;
  return json;
}

async function bootstrapGtk(): Promise<AuthSession> {
  const session: AuthSession = { cookies: new Map() };
  const res = await fetch(`${ED_ROOT}/login.awp?gtk=1&v=${ED_VERSION}`, {
    method: "GET",
    headers: {
      accept: "application/json, text/plain, */*",
      "user-agent": UA,
    },
    cache: "no-store",
  });
  ingestCookies(session, res.headers);
  try {
    const body = (await res.json()) as EdEnvelope<unknown>;
    if (body.token) session.gtk = body.token;
  } catch {
    // corps vide
  }
  if (!session.gtk) session.gtk = session.cookies.get("GTK");
  if (!session.gtk) {
    throw new Error("Impossible de récupérer le cookie GTK ÉcoleDirecte.");
  }
  return session;
}

function pickStudentAccount(
  accounts: EdAccount[],
  preferredName?: string
): { id: number; label: string } {
  const preferId = Number(process.env.ED_STUDENT_ID || "");
  const preferName = (preferredName || process.env.ED_STUDENT_NAME || "maelle")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const students = accounts.filter(
    (a) =>
      (a.typeCompte || "").toUpperCase() === "E" ||
      (a.typeCompte || "").toLowerCase() === "eleve"
  );

  const byName = (prenom?: string, nom?: string) => {
    const full = `${prenom ?? ""} ${nom ?? ""}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return full.includes(preferName);
  };

  if (preferId) {
    const direct = [...students, ...accounts].find((a) => a.id === preferId);
    if (direct) {
      return {
        id: direct.id,
        label:
          `${direct.prenom ?? ""} ${direct.nom ?? ""}`.trim() ||
          `élève ${direct.id}`,
      };
    }
    for (const acc of accounts) {
      const child = acc.profile?.eleves?.find((e) => e.id === preferId);
      if (child) {
        return {
          id: child.id,
          label:
            `${child.prenom ?? ""} ${child.nom ?? ""}`.trim() ||
            `élève ${child.id}`,
        };
      }
    }
  }

  const namedStudent = students.find((a) => byName(a.prenom, a.nom));
  if (namedStudent) {
    return {
      id: namedStudent.id,
      label:
        `${namedStudent.prenom ?? ""} ${namedStudent.nom ?? ""}`.trim() ||
        `élève ${namedStudent.id}`,
    };
  }

  for (const acc of accounts) {
    const child = acc.profile?.eleves?.find((e) => byName(e.prenom, e.nom));
    if (child) {
      return {
        id: child.id,
        label:
          `${child.prenom ?? ""} ${child.nom ?? ""}`.trim() ||
          `élève ${child.id}`,
      };
    }
  }

  if (students[0]) {
    return {
      id: students[0].id,
      label:
        `${students[0].prenom ?? ""} ${students[0].nom ?? ""}`.trim() ||
        `élève ${students[0].id}`,
    };
  }

  const firstChild = accounts[0]?.profile?.eleves?.[0];
  if (firstChild) {
    return {
      id: firstChild.id,
      label:
        `${firstChild.prenom ?? ""} ${firstChild.nom ?? ""}`.trim() ||
        `élève ${firstChild.id}`,
    };
  }

  if (accounts[0]) {
    return {
      id: accounts[0].id,
      label:
        `${accounts[0].prenom ?? ""} ${accounts[0].nom ?? ""}`.trim() ||
        `compte ${accounts[0].id}`,
    };
  }

  throw new Error("Aucun compte élève trouvé après connexion ÉcoleDirecte.");
}

async function fetchQcm(session: AuthSession): Promise<EdQcmChallenge> {
  const res = await edRequest<{
    question?: string;
    propositions?: string[];
  }>(session, "/connexion/doubleauth.awp?verbe=get", {
    body: {},
    includeGtk: false,
    includeToken: true,
    includeTwoFa: true,
  });

  if (res.code !== 200 || !res.data?.question || !res.data.propositions?.length) {
    throw Object.assign(
      new Error(res.message || "Impossible de charger le QCM ÉcoleDirecte."),
      { code: res.code || 250 }
    );
  }

  return {
    token: session.token || res.token || "",
    twoFaToken: session.twoFaToken || "",
    question: decodeB64Text(res.data.question),
    propositions: res.data.propositions.map(decodeB64Text),
    propositionValues: res.data.propositions,
  };
}

async function attemptLogin(
  creds: EdCredentials
): Promise<
  | { status: "ok"; session: AuthSession; accounts: EdAccount[] }
  | { status: "qcm"; session: AuthSession; challenge: EdQcmChallenge }
> {
  const session = await bootstrapGtk();

  // UUID appareil stable (une seule fois), comme une app installée
  let uuid = creds.uuid;
  if (!uuid) {
    uuid = randomUUID();
    await writeStoredCredentials({ ...creds, uuid });
  }

  const fa =
    creds.cn && creds.cv
      ? [{ cn: creds.cn, cv: creds.cv, uniq: false }]
      : [];

  const body: Record<string, unknown> = {
    identifiant: creds.username,
    motdepasse: creds.password,
    isReLogin: false,
    uuid,
    fa,
  };

  if (creds.cn && creds.cv) {
    body.cn = creds.cn;
    body.cv = creds.cv;
  }

  let loginRes = await edRequest<EdLoginData>(session, "/login.awp", {
    body,
    includeGtk: true,
    includeToken: false,
    includeTwoFa: false,
  });

  // cn/cv périmés → ED renvoie souvent 505 : on retente une fois sans FA
  if (loginRes.code === 505 && fa.length > 0) {
    await writeStoredCredentials({
      ...creds,
      cn: undefined,
      cv: undefined,
    });
    const retrySession = await bootstrapGtk();
    loginRes = await edRequest<EdLoginData>(retrySession, "/login.awp", {
      body: {
        identifiant: creds.username,
        motdepasse: creds.password,
        isReLogin: false,
        uuid,
        fa: [],
      },
      includeGtk: true,
      includeToken: false,
      includeTwoFa: false,
    });
    session.cookies = retrySession.cookies;
    session.gtk = retrySession.gtk;
    session.token = retrySession.token;
    session.twoFaToken = retrySession.twoFaToken;
  }

  if (loginRes.code === 250) {
    if (loginRes.data?.totp === true) {
      throw Object.assign(
        new Error(
          "Ce compte demande un code TOTP (application). Pas encore géré ici."
        ),
        { code: 250 }
      );
    }
    if (!session.token && loginRes.token) session.token = loginRes.token;
    const challenge = await fetchQcm(session);
    return { status: "qcm", session, challenge };
  }

  if (loginRes.code !== 200 || !session.token) {
    throw Object.assign(
      new Error(loginRes.message || "Identifiants ÉcoleDirecte invalides."),
      { code: loginRes.code }
    );
  }

  return {
    status: "ok",
    session,
    accounts: loginRes.data?.accounts ?? [],
  };
}

export async function answerQcmAndLogin(
  choix: string,
  cookieFa?: { cn?: string; cv?: string }
): Promise<{
  eleve: string;
  devoirs: HomeworkItem[];
  fa?: { cn: string; cv: string };
}> {
  const pending = await readPendingQcm();
  if (!pending) {
    throw Object.assign(
      new Error(
        "Session QCM expirée. Clique une seule fois sur « Réessayer », puis réponds au QCM."
      ),
      { code: 250 }
    );
  }

  const session = sessionFromJson(pending.session);
  // Restaurer les tokens du challenge
  session.token = pending.challenge.token || session.token;
  session.twoFaToken = pending.challenge.twoFaToken || session.twoFaToken;

  const choixB64 = pending.challenge.propositionValues.includes(choix)
    ? choix
    : Buffer.from(choix, "utf8").toString("base64");

  // Pas de nouveau login ici — on répond sur la session déjà ouverte
  const answerRes = await edRequest<{ cn?: string; cv?: string }>(
    session,
    "/connexion/doubleauth.awp?verbe=post",
    {
      body: { choix: choixB64 },
      includeGtk: false,
      includeToken: true,
      includeTwoFa: true,
    }
  );

  if (answerRes.code !== 200 || !answerRes.data?.cn || !answerRes.data?.cv) {
    throw Object.assign(
      new Error(
        answerRes.message ||
          "Réponse QCM refusée. Attends avant de réessayer pour ne pas bloquer le compte."
      ),
      { code: answerRes.code || 250 }
    );
  }

  const cn = answerRes.data.cn;
  const cv = answerRes.data.cv;
  void cookieFa;
  const creds = { ...pending.creds, cn, cv };
  await writeStoredCredentials(creds);
  await clearPendingQcm();

  // Un seul login final avec cn/cv mémorisés
  const finalLogin = await attemptLogin(creds);
  if (finalLogin.status === "qcm") {
    await savePendingQcm({
      creds,
      challenge: finalLogin.challenge,
      session: sessionToJson(finalLogin.session),
      createdAt: Date.now(),
    });
    throw Object.assign(
      new Error("Autre question de sécurité — choisis encore (une seule fois)."),
      { code: 250, challenge: finalLogin.challenge }
    );
  }

  const homework = await fetchHomeworkWithSession(
    finalLogin.session,
    finalLogin.accounts,
    creds.studentName
  );
  return { ...homework, fa: { cn, cv } };
}

export async function fetchHomeworkList(cookieFa?: {
  cn?: string;
  cv?: string;
}): Promise<
  | { eleve: string; devoirs: HomeworkItem[]; clearFa?: boolean }
  | { qcm: EdQcmChallenge }
> {
  const creds = await resolveCredentials({
    cookieCn: cookieFa?.cn,
    cookieCv: cookieFa?.cv,
  });

  if (!creds) {
    throw Object.assign(new Error("Identifiants ÉcoleDirecte manquants."), {
      code: 503,
    });
  }

  // Si un QCM est déjà en cours, ne pas relancer un login
  const pending = await readPendingQcm();
  if (pending) {
    return { qcm: pending.challenge };
  }

  const result = await attemptLogin(creds);

  if (result.status === "qcm") {
    await savePendingQcm({
      creds,
      challenge: result.challenge,
      session: sessionToJson(result.session),
      createdAt: Date.now(),
    });
    return { qcm: result.challenge };
  }

  await clearPendingQcm();
  return fetchHomeworkWithSession(
    result.session,
    result.accounts,
    creds.studentName
  );
}

async function fetchUpcoming(
  session: AuthSession,
  studentId: number
): Promise<UpcomingMap> {
  const res = await edRequest<UpcomingMap>(
    session,
    `/Eleves/${studentId}/cahierdetexte.awp?verbe=get`,
    { body: {}, includeGtk: false }
  );

  if (res.code !== 200 || !res.data) {
    throw Object.assign(
      new Error(res.message || "Impossible de lire le cahier de texte."),
      { code: res.code }
    );
  }

  return res.data;
}

async function fetchDay(
  session: AuthSession,
  studentId: number,
  date: string
): Promise<DayPage> {
  const res = await edRequest<DayPage>(
    session,
    `/Eleves/${studentId}/cahierdetexte/${date}.awp?verbe=get`,
    { body: {}, includeGtk: false }
  );

  if (res.code !== 200 || !res.data) {
    return { date, matieres: [] };
  }

  return res.data;
}

async function fetchHomeworkWithSession(
  session: AuthSession,
  accounts: EdAccount[],
  studentName?: string
): Promise<{ eleve: string; devoirs: HomeworkItem[] }> {
  const student = pickStudentAccount(accounts, studentName);
  const upcoming = await fetchUpcoming(session, student.id);
  const dates = Object.keys(upcoming).sort();
  const contentById = new Map<number, { contenu: string; prof?: string }>();

  for (const date of dates.slice(0, 14)) {
    const page = await fetchDay(session, student.id, date);
    for (const matiere of page.matieres ?? []) {
      const id = matiere.aFaire?.idDevoir ?? matiere.id;
      if (!id) continue;
      contentById.set(id, {
        contenu: decodeEdContent(matiere.aFaire?.contenu),
        prof: matiere.nomProf,
      });
    }
  }

  const devoirs: HomeworkItem[] = [];
  for (const date of dates) {
    for (const item of upcoming[date] ?? []) {
      const id = item.idDevoir;
      if (!id) continue;
      const detail = contentById.get(id);
      devoirs.push({
        id,
        date,
        matiere: item.matiere || item.codeMatiere || "Matière",
        contenu: detail?.contenu || "(contenu à récupérer)",
        fait: Boolean(item.effectue),
        interrogation: Boolean(item.interrogation),
        donneLe: item.donneLe,
        prof: detail?.prof,
      });
    }
  }

  devoirs.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.matiere.localeCompare(b.matiere, "fr");
  });

  return { eleve: student.label, devoirs };
}
