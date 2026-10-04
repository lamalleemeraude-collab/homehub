/**
 * Données ED secondaires (notes, EDT, vie scolaire).
 * 1 login par appel — à n’utiliser que sur les pages dédiées.
 */

import { randomUUID } from "crypto";
import {
  resolveCredentials,
  writeStoredCredentials,
} from "./credentials";
import { clearPendingQcm, readPendingQcm } from "./pending-qcm";
import type { EdQcmChallenge } from "./types";
import type {
  DashboardAbsence,
  DashboardCourse,
  DashboardGrade,
} from "./dashboard-types";

export type { DashboardAbsence, DashboardCourse, DashboardGrade };

const ED_VERSION = process.env.ED_API_VERSION?.trim() || "4.101.4";
const ED_ROOT = "https://api.ecoledirecte.com/v3";
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";

type AuthSession = {
  cookies: Map<string, string>;
  gtk?: string;
  token?: string;
  twoFaToken?: string;
};

type EdAccount = {
  id: number;
  typeCompte?: string;
  nom?: string;
  prenom?: string;
  profile?: { eleves?: Array<{ id: number; nom?: string; prenom?: string }> };
};

function ingest(session: AuthSession, headers: Headers) {
  for (const line of headers.getSetCookie?.() ?? []) {
    const [pair] = line.split(";");
    const eq = pair.indexOf("=");
    if (eq < 1) continue;
    session.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  const gtk = headers.get("X-GTK");
  if (gtk) session.gtk = gtk;
  const token = headers.get("X-Token");
  if (token) session.token = token;
  const twoFa = headers.get("2FA-Token");
  if (twoFa) session.twoFaToken = twoFa;
}

async function edRequest<T>(
  session: AuthSession,
  path: string,
  body: Record<string, unknown>,
  opts: { gtk?: boolean; token?: boolean; twoFa?: boolean } = {}
): Promise<{ code: number; message?: string; token?: string; data?: T }> {
  const headers: Record<string, string> = {
    accept: "application/json, text/plain, */*",
    "user-agent": UA,
    "content-type": "application/x-www-form-urlencoded",
    origin: "https://www.ecoledirecte.com",
    referer: "https://www.ecoledirecte.com/",
  };
  const cookie = [...session.cookies.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  if (cookie) headers.Cookie = cookie;
  if (opts.gtk !== false) {
    const gtk = session.gtk || session.cookies.get("GTK");
    if (gtk) headers["X-GTK"] = gtk;
  }
  if (opts.token !== false && session.token) headers["X-Token"] = session.token;
  if (opts.twoFa !== false && session.twoFaToken)
    headers["2FA-Token"] = session.twoFaToken;

  const params = new URLSearchParams();
  params.set("data", JSON.stringify(body));
  const res = await fetch(
    `${ED_ROOT}${path}${path.includes("?") ? "&" : "?"}v=${ED_VERSION}`,
    { method: "POST", headers, body: params, cache: "no-store", redirect: "manual" }
  );
  ingest(session, res.headers);
  const json = (await res.json()) as {
    code: number;
    message?: string;
    token?: string;
    data?: T;
  };
  if (json.token) session.token = json.token;
  return json;
}

async function bootstrap(): Promise<AuthSession> {
  const session: AuthSession = { cookies: new Map() };
  const res = await fetch(`${ED_ROOT}/login.awp?gtk=1&v=${ED_VERSION}`, {
    headers: { accept: "application/json", "user-agent": UA },
    cache: "no-store",
  });
  ingest(session, res.headers);
  try {
    const body = (await res.json()) as { token?: string };
    if (body.token) session.gtk = body.token;
  } catch {
    /* empty */
  }
  if (!session.gtk) session.gtk = session.cookies.get("GTK");
  if (!session.gtk) throw new Error("GTK manquant");
  return session;
}

function pickStudent(
  accounts: EdAccount[],
  preferredName = "maelle"
): { id: number; label: string } {
  const want = preferredName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const students = accounts.filter(
    (a) => (a.typeCompte || "").toUpperCase() === "E"
  );
  const match = students.find((a) =>
    `${a.prenom ?? ""} ${a.nom ?? ""}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(want)
  );
  const s = match || students[0] || accounts[0];
  if (!s) throw new Error("Aucun élève");
  for (const acc of accounts) {
    const child = acc.profile?.eleves?.find((e) =>
      `${e.prenom ?? ""} ${e.nom ?? ""}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(want)
    );
    if (child)
      return {
        id: child.id,
        label: `${child.prenom ?? ""} ${child.nom ?? ""}`.trim(),
      };
  }
  return {
    id: s.id,
    label: `${s.prenom ?? ""} ${s.nom ?? ""}`.trim() || `élève ${s.id}`,
  };
}

async function loginSession(cookieFa?: {
  cn?: string;
  cv?: string;
  uuid?: string;
}): Promise<
  | { status: "ok"; session: AuthSession; studentId: number; eleve: string }
  | { status: "qcm"; challenge: EdQcmChallenge }
> {
  const pending = await readPendingQcm();
  if (pending) return { status: "qcm", challenge: pending.challenge };

  const creds = await resolveCredentials({
    cookieCn: cookieFa?.cn,
    cookieCv: cookieFa?.cv,
    cookieUuid: cookieFa?.uuid,
  });
  if (!creds) {
    throw Object.assign(new Error("Identifiants manquants"), { code: 503 });
  }

  const session = await bootstrap();
  let uuid = creds.uuid;
  if (!uuid) {
    uuid = randomUUID();
    await writeStoredCredentials({ ...creds, uuid });
  }
  const fa =
    creds.cn && creds.cv ? [{ cn: creds.cn, cv: creds.cv, uniq: false }] : [];

  let loginRes = await edRequest<{ accounts?: EdAccount[]; totp?: boolean }>(
    session,
    "/login.awp",
    {
      identifiant: creds.username,
      motdepasse: creds.password,
      isReLogin: false,
      uuid,
      fa,
      ...(creds.cn && creds.cv ? { cn: creds.cn, cv: creds.cv } : {}),
    },
    { token: false, twoFa: false }
  );

  if (loginRes.code === 505 && fa.length > 0) {
    const retry = await bootstrap();
    loginRes = await edRequest<{ accounts?: EdAccount[] }>(
      retry,
      "/login.awp",
      {
        identifiant: creds.username,
        motdepasse: creds.password,
        isReLogin: false,
        uuid,
        fa: [],
      },
      { token: false, twoFa: false }
    );
    session.cookies = retry.cookies;
    session.gtk = retry.gtk;
    session.token = retry.token;
    session.twoFaToken = retry.twoFaToken;
  }

  if (loginRes.code === 250) {
    throw Object.assign(
      new Error("QCM requis — ouvre d’abord Devoirs pour te connecter."),
      { code: 250 }
    );
  }
  if (loginRes.code !== 200 || !session.token) {
    throw Object.assign(
      new Error(loginRes.message || "Connexion impossible"),
      { code: loginRes.code }
    );
  }

  await clearPendingQcm();
  const student = pickStudent(
    loginRes.data?.accounts ?? [],
    creds.studentName || "maelle"
  );
  return {
    status: "ok",
    session,
    studentId: student.id,
    eleve: student.label,
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchStudentExtras(cookieFa?: {
  cn?: string;
  cv?: string;
  uuid?: string;
}): Promise<{
  notes: DashboardGrade[];
  cours: DashboardCourse[];
  absences: DashboardAbsence[];
  eleve?: string;
}> {
  const auth = await loginSession(cookieFa);
  if (auth.status === "qcm") {
    throw Object.assign(new Error("QCM requis"), {
      code: 250,
      challenge: auth.challenge,
    });
  }

  const { session, studentId, eleve } = auth;
  const notes: DashboardGrade[] = [];
  const cours: DashboardCourse[] = [];
  const absences: DashboardAbsence[] = [];

  const notesRes = await edRequest<{
    notes?: Array<{
      libelleMatiere?: string;
      valeur?: string;
      noteSur?: string;
      date?: string;
      devoir?: string;
    }>;
  }>(
    session,
    `/eleves/${studentId}/notes.awp?verbe=get`,
    { anneeScolaire: "" },
    { gtk: false }
  );
  if (notesRes.code === 200 && notesRes.data?.notes) {
    for (const n of notesRes.data.notes.slice(-8).reverse()) {
      notes.push({
        matiere: n.libelleMatiere || "Matière",
        note: n.valeur || "—",
        sur: n.noteSur || "20",
        date: n.date,
        devoir: n.devoir,
      });
    }
  }

  const day = todayIso();
  const edtRes = await edRequest<
    Array<{
      matiere?: string;
      text?: string;
      start_date?: string;
      end_date?: string;
      salle?: string;
      prof?: string;
      isAnnule?: boolean;
      cancel?: boolean;
    }>
  >(
    session,
    `/E/${studentId}/emploidutemps.awp?verbe=get`,
    { dateDebut: day, dateFin: day },
    { gtk: false }
  );
  if (edtRes.code === 200 && Array.isArray(edtRes.data)) {
    for (const c of edtRes.data) {
      const debut = (c.start_date || "").slice(11, 16);
      const fin = (c.end_date || "").slice(11, 16);
      cours.push({
        matiere: c.matiere || c.text || "Cours",
        debut: debut || "—",
        fin: fin || "—",
        salle: c.salle,
        prof: c.prof,
        annule: Boolean(c.isAnnule || c.cancel),
      });
    }
    cours.sort((a, b) => a.debut.localeCompare(b.debut));
  }

  const vieRes = await edRequest<{
    absencesRetards?: Array<{
      typeElement?: string;
      date?: string;
      displayDate?: string;
      libelle?: string;
      justifie?: boolean;
    }>;
  }>(
    session,
    `/eleves/${studentId}/viescolaire.awp?verbe=get`,
    {},
    { gtk: false }
  );
  if (vieRes.code === 200 && vieRes.data?.absencesRetards) {
    for (const a of vieRes.data.absencesRetards.slice(0, 8)) {
      absences.push({
        type: a.typeElement || "Absence",
        date: a.displayDate || a.date || "",
        libelle: a.libelle || "",
        justifie: Boolean(a.justifie),
      });
    }
  }

  return { notes, cours, absences, eleve };
}

export async function fetchNotesOnly(cookieFa?: {
  cn?: string;
  cv?: string;
}) {
  const extras = await fetchStudentExtras(cookieFa);
  return { eleve: extras.eleve, notes: extras.notes };
}

export async function fetchEdtOnly(cookieFa?: {
  cn?: string;
  cv?: string;
}) {
  const extras = await fetchStudentExtras(cookieFa);
  return { eleve: extras.eleve, cours: extras.cours };
}

export async function fetchVieOnly(cookieFa?: {
  cn?: string;
  cv?: string;
}) {
  const extras = await fetchStudentExtras(cookieFa);
  return { eleve: extras.eleve, absences: extras.absences };
}
