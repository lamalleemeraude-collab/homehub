import { NextResponse } from "next/server";
import { readFaFromCookie } from "@/lib/ecoledirecte/fa-cookie";
import { fetchStudentExtras } from "@/lib/ecoledirecte/extras";

export const dynamic = "force-dynamic";

/** ?scope=notes|edt|vie|all */
export async function GET(request: Request) {
  try {
    const scope =
      new URL(request.url).searchParams.get("scope") || "all";
    const fa = await readFaFromCookie();
    const extras = await fetchStudentExtras(fa);

    if (scope === "notes") {
      return NextResponse.json({
        ok: true,
        eleve: extras.eleve,
        notes: extras.notes,
      });
    }
    if (scope === "edt") {
      return NextResponse.json({
        ok: true,
        eleve: extras.eleve,
        cours: extras.cours,
      });
    }
    if (scope === "vie") {
      return NextResponse.json({
        ok: true,
        eleve: extras.eleve,
        absences: extras.absences,
      });
    }

    return NextResponse.json({ ok: true, ...extras });
  } catch (error) {
    const err = error as Error & { code?: number; challenge?: unknown };
    console.error("[api/ecoledirecte/extras]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Erreur",
        code: err.code,
        qcm: err.challenge,
      },
      { status: err.code === 250 ? 401 : 502 }
    );
  }
}
