import { NextResponse } from "next/server";
import {
  normalizeIncomingEvents,
  parsePostBody,
} from "@/lib/iphone-sync/normalize";
import {
  readIphoneSyncStore,
  writeIphoneSyncStore,
} from "@/lib/iphone-sync/storage";
import { CALENDAR_NO_CACHE_HEADERS } from "@/lib/calendar/no-cache-headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAuthorized(request: Request): boolean {
  const secret =
    process.env.WEBHOOK_CALENDAR_SECRET?.trim() ??
    process.env.IPHONE_SYNC_SECRET?.trim();
  if (!secret) return true;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const token = request.headers.get("x-hub-sync-token");
  return token === secret;
}

/** Alias rétrocompatible de /api/webhook-calendar */
export async function GET() {
  const store = await readIphoneSyncStore();

  return NextResponse.json(
    {
      syncedAt: store.syncedAt || null,
      count: store.events.length,
      events: store.events,
    },
    { headers: CALENDAR_NO_CACHE_HEADERS }
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Non autorisé" },
      { status: 401, headers: CALENDAR_NO_CACHE_HEADERS }
    );
  }

  try {
    const body = (await request.json()) as unknown;
    const incoming = parsePostBody(body);
    const events = normalizeIncomingEvents(incoming);
    const store = await writeIphoneSyncStore(events);

    return NextResponse.json(
      {
        ok: true,
        syncedAt: store.syncedAt,
        count: store.events.length,
        events: store.events,
      },
      { headers: CALENDAR_NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("[api/iphone-sync]", error);
    return NextResponse.json(
      { error: "Corps JSON invalide" },
      { status: 400, headers: CALENDAR_NO_CACHE_HEADERS }
    );
  }
}
