const EMBED_BASE = "https://www.youtube-nocookie.com/embed";

export type YouTubeTarget = {
  embedUrl: string;
  label: string;
  kind: "video" | "playlist" | "search";
};

function embedVideo(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  return `${EMBED_BASE}/${videoId}?${params.toString()}`;
}

function embedPlaylist(playlistId: string): string {
  return `${EMBED_BASE}/videoseries?list=${playlistId}&autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

export function parseYouTubeInput(input: string): YouTubeTarget | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      embedUrl: embedVideo(trimmed),
      label: "Vidéo YouTube",
      kind: "video",
    };
  }

  let url: URL;
  try {
    url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const videoId = url.pathname.slice(1).split("/")[0];
    if (videoId) {
      return { embedUrl: embedVideo(videoId), label: "Vidéo YouTube", kind: "video" };
    }
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const videoId = url.searchParams.get("v");
    if (videoId) {
      return { embedUrl: embedVideo(videoId), label: "Vidéo YouTube", kind: "video" };
    }

    const listId = url.searchParams.get("list");
    if (listId) {
      return {
        embedUrl: embedPlaylist(listId),
        label: "Playlist YouTube",
        kind: "playlist",
      };
    }

    const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) {
      return {
        embedUrl: embedVideo(embedMatch[1]),
        label: "Vidéo YouTube",
        kind: "video",
      };
    }
  }

  return null;
}

export function buildVideoTarget(
  videoId: string,
  label: string
): YouTubeTarget {
  return {
    embedUrl: embedVideo(videoId),
    label,
    kind: "video",
  };
}

export const YOUTUBE_HOME: YouTubeTarget = {
  embedUrl: embedVideo("jfKfPfyJRdk"),
  label: "Lofi Girl — accueil",
  kind: "video",
};

export type YouTubeSearchResult = {
  videoId: string;
  title: string;
  author: string;
  lengthSeconds: number;
};

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
