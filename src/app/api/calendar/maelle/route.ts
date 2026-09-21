import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/calendar/fetch-events";
import { CALENDAR_NO_CACHE_HEADERS } from "@/lib/calendar/no-cache-headers";
import { toCalendarApiPayload } from "@/lib/calendar/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const result = await getCalendarEvents("maelle");
    return NextResponse.json(toCalendarApiPayload(result), {
      headers: CALENDAR_NO_CACHE_HEADERS,
    });
  } catch (error) {
    console.error("[api/calendar/maelle]", error);
    return NextResponse.json(
      {
        events: [],
        syncedAt: new Date().toISOString(),
        source: "ical" as const,
        fromCache: false,
        error: true,
      },
      { status: 200, headers: CALENDAR_NO_CACHE_HEADERS }
    );
  }
}
