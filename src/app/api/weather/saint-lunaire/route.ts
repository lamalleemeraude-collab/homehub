import { NextResponse } from "next/server";
import { fetchWeatherBulletin } from "@/lib/weather/bulletin";
import { fallbackWeatherBulletin } from "@/lib/weather/fallback";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
};

/** Résumé léger pour widgets & tenue (rétrocompat). */
export async function GET() {
  try {
    const bulletin = await fetchWeatherBulletin();
    return NextResponse.json(
      {
        location: bulletin.location,
        current: bulletin.current,
        tomorrow: bulletin.tomorrowSimple,
        updatedAt: bulletin.updatedAt,
      },
      { headers: CACHE_HEADERS }
    );
  } catch {
    const fb = fallbackWeatherBulletin();
    return NextResponse.json(
      {
        location: fb.location,
        current: fb.current,
        tomorrow: fb.tomorrowSimple,
        updatedAt: fb.updatedAt,
      },
      { headers: CACHE_HEADERS }
    );
  }
}
