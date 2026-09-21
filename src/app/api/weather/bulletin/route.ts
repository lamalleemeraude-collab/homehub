import { NextResponse } from "next/server";
import { fetchWeatherBulletin } from "@/lib/weather/bulletin";
import { fallbackWeatherBulletin } from "@/lib/weather/fallback";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
};

export async function GET() {
  try {
    const bulletin = await fetchWeatherBulletin();
    return NextResponse.json(bulletin, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json(fallbackWeatherBulletin(), {
      status: 200,
      headers: CACHE_HEADERS,
    });
  }
}
