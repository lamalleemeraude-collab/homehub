import { NextResponse } from "next/server";
import { fetchHomeworkList } from "@/lib/ecoledirecte/client";
import { readFaFromCookie } from "@/lib/ecoledirecte/fa-cookie";
import {
  generateFromCourse,
  generateFromHomework,
} from "@/lib/flashcards/generate";
import type { GenerateFlashcardsRequest } from "@/lib/flashcards/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateFlashcardsRequest;

    if (body.mode === "cours") {
      const result = await generateFromCourse({
        text: body.text,
        images: body.images,
        matiere: body.matiere,
      });
      return NextResponse.json(result);
    }

    if (body.mode !== "devoirs") {
      return NextResponse.json(
        { ok: false, error: "Mode inconnu" },
        { status: 400 }
      );
    }

    const fa = await readFaFromCookie();
    const hw = await fetchHomeworkList(fa);
    if ("qcm" in hw) {
      return NextResponse.json(
        {
          ok: false,
          code: 250,
          error: "Connexion sécurité requise — ouvre Devoirs pour le QCM.",
        },
        { status: 401 }
      );
    }

    let items = hw.devoirs.filter((d) => !d.fait);
    if (body.homeworkIds?.length) {
      const set = new Set(body.homeworkIds);
      items = hw.devoirs.filter((d) => set.has(d.id));
    } else {
      // Auto : évals d’abord, sinon tous les devoirs à faire
      const evals = items.filter((d) => d.interrogation);
      items = evals.length > 0 ? evals : items;
    }

    if (items.length === 0) {
      items = hw.devoirs.slice(0, 6);
    }

    const result = await generateFromHomework(items.slice(0, 10));
    return NextResponse.json(result);
  } catch (error) {
    const err = error as Error & { code?: number };
    console.error("[api/flashcards/generate]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Impossible de créer les cartes",
        code: err.code,
      },
      { status: err.code === 503 ? 503 : 502 }
    );
  }
}
