import type { IcloudApiEvent } from "@/lib/hub-events";

/**
 * Provider Google Calendar — structure prête pour OAuth / compte de service.
 * Variables : GOOGLE_CALENDAR_API_KEY, GOOGLE_CALENDAR_{MAELLE|PAPA}_ID
 * ou GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 */
export async function fetchGoogleCalendarEvents(
  calendarId: string
): Promise<IcloudApiEvent[]> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

  if (!calendarId) {
    throw new Error("[calendar/google] GOOGLE_CALENDAR_ID manquant");
  }

  if (!apiKey && !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    throw new Error(
      "[calendar/google] Configure GOOGLE_CALENDAR_API_KEY (calendrier public) ou un compte de service"
    );
  }

  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(
    now.getFullYear(),
    now.getMonth() + 18,
    0,
    23,
    59,
    59
  ).toISOString();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  if (apiKey) {
    params.set("key", apiKey);
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;

  const headers: HeadersInit = {};
  const serviceToken = await getServiceAccountToken();
  if (serviceToken) {
    headers.Authorization = `Bearer ${serviceToken}`;
  }

  const res = await fetch(url, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`[calendar/google] HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    items?: Array<{
      id?: string;
      summary?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }>;
  };

  return (data.items ?? [])
    .map((item) => {
      const startRaw = item.start?.dateTime ?? item.start?.date;
      const endRaw = item.end?.dateTime ?? item.end?.date ?? startRaw;
      if (!startRaw || !endRaw) return null;

      const start = startRaw.includes("T")
        ? startRaw
        : `${startRaw}T00:00:00.000Z`;
      const end = endRaw.includes("T")
        ? endRaw
        : `${endRaw}T23:59:59.000Z`;

      return {
        id: item.id ?? `${start}-${item.summary ?? "event"}`,
        title: (item.summary ?? "Sans titre").trim(),
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      };
    })
    .filter((e): e is IcloudApiEvent => e !== null)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

async function getServiceAccountToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!email || !privateKey) return null;

  // JWT OAuth2 — implémentation complète à brancher (google-auth-library)
  // Pour l'instant retourne null ; l'API key suffit pour calendriers publics.
  void email;
  void privateKey;
  return null;
}
