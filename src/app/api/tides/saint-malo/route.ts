import { NextResponse } from "next/server";
import { fetchSaintMaloTides } from "@/lib/tides/fetch-saint-malo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const snapshot = await fetchSaintMaloTides();
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    console.error("[api/tides/saint-malo]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Erreur marées",
      },
      { status: 502 }
    );
  }
}
