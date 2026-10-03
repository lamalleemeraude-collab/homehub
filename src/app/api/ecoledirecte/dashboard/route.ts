import { NextResponse } from "next/server";
import { fetchStudentDashboard } from "@/lib/ecoledirecte/dashboard";
import { readFaFromCookie } from "@/lib/ecoledirecte/fa-cookie";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fa = await readFaFromCookie();
    const result = await fetchStudentDashboard(fa);

    if ("qcm" in result) {
      return NextResponse.json(
        {
          ok: false,
          code: 250,
          qcm: result.qcm,
          error: "Double authentification requise",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const err = error as Error & { code?: number };
    console.error("[api/ecoledirecte/dashboard]", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Erreur dashboard",
        code: err.code,
      },
      { status: err.code === 503 ? 503 : 502 }
    );
  }
}
