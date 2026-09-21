import { NextResponse } from "next/server";
import { getAllCalendarEvents } from "@/lib/calendar/fetch-events";
import { CALENDAR_NO_CACHE_HEADERS } from "@/lib/calendar/no-cache-headers";
import { toCalendarApiPayload } from "@/lib/calendar/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sources = await getAllCalendarEvents();

    return NextResponse.json(
      {
        syncedAt: new Date().toISOString(),
        sources: sources.map((entry) => ({
          id: entry.sourceId,
          label: entry.label,
          account: entry.account,
          iphoneName: entry.iphoneName,
          configured: entry.configured,
          error: entry.error ?? null,
          ...(entry.result ? toCalendarApiPayload(entry.result) : { events: [] }),
        })),
      },
      { headers: CALENDAR_NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("[api/calendar/sync]", error);
    return NextResponse.json(
      { sources: [], syncedAt: new Date().toISOString(), error: true },
      { status: 200, headers: CALENDAR_NO_CACHE_HEADERS }
    );
  }
}
