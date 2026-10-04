import { NextResponse } from "next/server";
import {
  answerQcmAndLogin,
  fetchHomeworkList,
} from "@/lib/ecoledirecte/client";
import {
  applyFaCookies,
  applyUuidCookie,
  clearFaCookies,
  readFaFromCookie,
} from "@/lib/ecoledirecte/fa-cookie";
import type {
  HomeworkErrorResponse,
  HomeworkResponse,
} from "@/lib/ecoledirecte/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function okPayload(
  eleve: string,
  devoirs: HomeworkResponse["devoirs"]
): HomeworkResponse {
  return {
    ok: true,
    eleve,
    syncedAt: new Date().toISOString(),
    count: devoirs.length,
    devoirs,
  };
}

export async function GET() {
  try {
    const fa = await readFaFromCookie();
    const result = await fetchHomeworkList(fa);

    if ("qcm" in result) {
      const res = NextResponse.json(
        {
          ok: false,
          error: "Double authentification requise (QCM ÉcoleDirecte).",
          code: 250,
          qcm: result.qcm,
          hint: "Choisis la bonne réponse ci-dessous (une seule fois).",
        },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
      if (result.uuid) applyUuidCookie(res, result.uuid);
      return res;
    }

    const res = NextResponse.json(okPayload(result.eleve, result.devoirs), {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
    if (result.uuid) applyUuidCookie(res, result.uuid);
    return res;
  } catch (error) {
    const err = error as Error & { code?: number; challenge?: unknown };
    console.error("[api/ecoledirecte]", err);

    const payload: HomeworkErrorResponse & {
      qcm?: unknown;
      hint?: string;
    } = {
      ok: false,
      error: err.message || "Erreur ÉcoleDirecte",
      code: err.code,
      hint:
        err.code === 250
          ? "Réponds au QCM de sécurité ÉcoleDirecte."
          : err.code === 503
            ? "Configure ED_USERNAME / ED_PASSWORD sur Vercel (ou le formulaire en local)."
            : err.code === 505
              ? "Souvent un blocage temporaire après trop d’essais. Connecte-toi une fois sur ecoledirecte.com, attends 10–15 min, puis réessaie ici."
              : "Vérifie les identifiants Maelle (ou compte famille).",
    };

    if (err.challenge) payload.qcm = err.challenge;

    const status =
      err.code === 503 ? 503 : err.code === 505 || err.code === 250 ? 401 : 502;

    const res = NextResponse.json(payload, {
      status,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });

    // FA périmé → effacer cookies
    if (err.code === 505) clearFaCookies(res);
    return res;
  }
}

/** Réponse au QCM double-auth. Body: { choix: string, resume?: string } */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      choix?: string;
      resume?: string;
    };
    const choix = body.choix?.trim() ?? "";
    if (!choix) {
      return NextResponse.json(
        { ok: false, error: "Réponse QCM manquante." },
        { status: 400 }
      );
    }

    const cookieFa = await readFaFromCookie();
    const result = await answerQcmAndLogin(
      choix,
      cookieFa,
      body.resume?.trim()
    );

    if (result.qcm) {
      const res = NextResponse.json(
        {
          ok: false,
          error: "Autre question de sécurité — choisis encore (une seule fois).",
          code: 250,
          qcm: result.qcm,
        },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
      if (result.uuid) applyUuidCookie(res, result.uuid);
      return res;
    }

    const res = NextResponse.json(okPayload(result.eleve, result.devoirs), {
      headers: { "Cache-Control": "no-store" },
    });
    if (result.fa) applyFaCookies(res, result.fa.cn, result.fa.cv);
    if (result.uuid) applyUuidCookie(res, result.uuid);
    return res;
  } catch (error) {
    const err = error as Error & { code?: number; challenge?: unknown };
    console.error("[api/ecoledirecte POST]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Échec QCM",
        code: err.code,
        qcm: err.challenge,
      },
      { status: 401 }
    );
  }
}
