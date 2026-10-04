import { NextResponse } from "next/server";
import { fetchHomeworkList } from "@/lib/ecoledirecte/client";
import { readFaFromCookie } from "@/lib/ecoledirecte/fa-cookie";

export const dynamic = "force-dynamic";

/** Liste courte pour choisir quoi transformer en flashcards. */
export async function GET() {
  try {
    const fa = await readFaFromCookie();
    const hw = await fetchHomeworkList(fa);
    if ("qcm" in hw) {
      return NextResponse.json(
        { ok: false, code: 250, error: "QCM requis — ouvre Devoirs." },
        { status: 401 }
      );
    }

    const items = [...hw.devoirs]
      .filter((d) => !d.fait || d.interrogation)
      .sort((a, b) => {
        if (a.interrogation !== b.interrogation) return a.interrogation ? -1 : 1;
        return a.date.localeCompare(b.date);
      })
      .slice(0, 12)
      .map((d) => ({
        id: d.id,
        date: d.date,
        matiere: d.matiere,
        interrogation: d.interrogation,
        preview: d.contenu.split("\n")[0]?.slice(0, 120) || d.matiere,
      }));

    return NextResponse.json({
      ok: true,
      eleve: hw.eleve,
      items,
    });
  } catch (error) {
    const err = error as Error & { code?: number };
    return NextResponse.json(
      { ok: false, error: err.message, code: err.code },
      { status: 502 }
    );
  }
}
