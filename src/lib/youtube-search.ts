import type { YouTubeSearchResult } from "@/lib/youtube-url";

const INNERTUBE_URL =
  "https://www.youtube.com/youtubei/v1/search?prettyPrint=false";

const INNERTUBE_CLIENT = {
  clientName: "WEB",
  clientVersion: "2.20260201.00.00",
  hl: "fr",
  gl: "FR",
};

function parseLengthText(text: string | undefined): number {
  if (!text) return 0;
  const parts = text.split(":").map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function textFromRuns(
  runs?: Array<{ text?: string }> | undefined
): string {
  return runs?.map((r) => r.text ?? "").join("") ?? "";
}

function parseInnerTubeResults(data: unknown): YouTubeSearchResult[] {
  const root = data as Record<string, unknown>;
  const contents = (
    (
      (
        (
          (root.contents as Record<string, unknown> | undefined)
            ?.twoColumnSearchResultsRenderer as Record<string, unknown> | undefined
        )?.primaryContents as Record<string, unknown> | undefined
      )?.sectionListRenderer as Record<string, unknown> | undefined
    )?.contents as unknown[] | undefined
  ) ?? [];

  const results: YouTubeSearchResult[] = [];

  for (const section of contents) {
    const sectionObj = section as Record<string, unknown>;
    const items =
      (
        sectionObj.itemSectionRenderer as Record<string, unknown> | undefined
      )?.contents as unknown[] | undefined;

    for (const item of items ?? []) {
      const vr = (item as Record<string, unknown>).videoRenderer as
        | Record<string, unknown>
        | undefined;
      if (!vr?.videoId || typeof vr.videoId !== "string") continue;

      const titleRuns = (vr.title as Record<string, unknown> | undefined)
        ?.runs as Array<{ text?: string }> | undefined;

      const authorRuns =
        (
          (vr.ownerText as Record<string, unknown> | undefined)?.runs as
            | Array<{ text?: string }>
            | undefined
        ) ??
        (
          (vr.longBylineText as Record<string, unknown> | undefined)?.runs as
            | Array<{ text?: string }>
            | undefined
        );

      const lengthText = (
        vr.lengthText as Record<string, unknown> | undefined
      )?.simpleText as string | undefined;

      results.push({
        videoId: vr.videoId,
        title: textFromRuns(titleRuns) || "Sans titre",
        author: textFromRuns(authorRuns),
        lengthSeconds: parseLengthText(lengthText),
      });

      if (results.length >= 12) return results;
    }
  }

  return results;
}

export async function searchYouTubeInnerTube(
  query: string
): Promise<YouTubeSearchResult[]> {
  const res = await fetch(INNERTUBE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({
      context: { client: INNERTUBE_CLIENT },
      query,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) throw new Error(`innertube_${res.status}`);

  const data = await res.json();
  return parseInnerTubeResults(data);
}

export async function searchYouTubeDataApi(
  query: string,
  apiKey: string
): Promise<YouTubeSearchResult[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "12");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`youtube_api_${res.status}`);

  const data = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: { title?: string; channelTitle?: string };
    }>;
  };

  return (data.items ?? [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      videoId: item.id!.videoId!,
      title: item.snippet?.title ?? "Sans titre",
      author: item.snippet?.channelTitle ?? "",
      lengthSeconds: 0,
    }));
}

export async function searchYouTube(query: string): Promise<YouTubeSearchResult[]> {
  const errors: string[] = [];

  try {
    const results = await searchYouTubeInnerTube(query);
    if (results.length > 0) return results;
  } catch (e) {
    errors.push(String(e));
  }

  const apiKey = process.env.YOUTUBE_API_KEY ?? process.env.GOOGLE_CALENDAR_API_KEY;
  if (apiKey) {
    try {
      const results = await searchYouTubeDataApi(query, apiKey);
      if (results.length > 0) return results;
    } catch (e) {
      errors.push(String(e));
    }
  }

  if (errors.length > 0) throw new Error(errors.join("; "));
  return [];
}
