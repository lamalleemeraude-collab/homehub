import { NextResponse } from "next/server";
import { searchYouTube } from "@/lib/youtube-search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchYouTube(q);
    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[youtube/search]", q, error);
    return NextResponse.json(
      { results: [], error: "search_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
