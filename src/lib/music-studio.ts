export type MusicProvider = "youtube" | "spotify";

export type MusicPreset = {
  id: string;
  label: string;
  description: string;
  provider: MusicProvider;
  embedUrl: string;
  externalUrl: string;
  gradient: string;
  accent: string;
};

type MusicMoodConfig = {
  id: string;
  label: string;
  description: string;
  provider: MusicProvider;
  playlistId: string;
  gradient: string;
  accent: string;
};

/** Playlist / vidéo par défaut — surchargeable via .env.local */
const DEFAULT_YOUTUBE_VIDEO = "jfKfPfyJRdk";
const DEFAULT_SPOTIFY_PLAYLIST = "37i9dQZF1DX4sWSpwq3LiO";

function youtubeVideoEmbed(videoOrPlaylistId: string, isPlaylist = false): string {
  if (isPlaylist) {
    return `https://www.youtube.com/embed/videoseries?list=${videoOrPlaylistId}&autoplay=1&rel=0&modestbranding=1`;
  }
  return `https://www.youtube.com/embed/${videoOrPlaylistId}?autoplay=1&rel=0&modestbranding=1`;
}

function spotifyEmbed(playlistId: string): string {
  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
}

export function getMusicPresets(): MusicPreset[] {
  const youtubeId =
    process.env.NEXT_PUBLIC_MUSIC_YOUTUBE_PLAYLIST ?? DEFAULT_YOUTUBE_VIDEO;
  const spotifyPlaylist =
    process.env.NEXT_PUBLIC_MUSIC_SPOTIFY_PLAYLIST ?? DEFAULT_SPOTIFY_PLAYLIST;

  const youtubeIsPlaylist = youtubeId.startsWith("PL");

  return [
    {
      id: "youtube-main",
      label: "YouTube Music",
      description: "Lofi & playlists intégrées",
      provider: "youtube",
      embedUrl: youtubeVideoEmbed(youtubeId, youtubeIsPlaylist),
      externalUrl: youtubeIsPlaylist
        ? `https://music.youtube.com/playlist?list=${youtubeId}`
        : `https://www.youtube.com/watch?v=${youtubeId}`,
      gradient: "from-red-500 to-red-700",
      accent: "bg-red-50 border-red-200 text-red-900",
    },
    {
      id: "spotify-main",
      label: "Spotify",
      description: "Écoute en streaming",
      provider: "spotify",
      embedUrl: spotifyEmbed(spotifyPlaylist),
      externalUrl: `https://open.spotify.com/playlist/${spotifyPlaylist}`,
      gradient: "from-emerald-500 to-green-700",
      accent: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
  ];
}

export const MUSIC_MOOD_PRESETS: MusicMoodConfig[] = [
  {
    id: "focus-yt",
    label: "Focus",
    description: "Concentration",
    provider: "youtube",
    playlistId: "PLMC9KNkYLKnMdJzFb1ADYjZvVPDyM7t2",
    gradient: "from-indigo-500 to-violet-600",
    accent: "bg-indigo-50 border-indigo-200 text-indigo-900",
  },
  {
    id: "chill-spotify",
    label: "Chill",
    description: "Détente",
    provider: "spotify",
    playlistId: "37i9dQZF1DX3Ogo9pFvBkY",
    gradient: "from-teal-500 to-cyan-600",
    accent: "bg-teal-50 border-teal-200 text-teal-900",
  },
  {
    id: "classique-spotify",
    label: "Classique",
    description: "Piano & cordes",
    provider: "spotify",
    playlistId: "37i9dQZF1DX4sWSpwq3LiO",
    gradient: "from-amber-500 to-orange-600",
    accent: "bg-amber-50 border-amber-200 text-amber-900",
  },
];

export function moodToPreset(mood: MusicMoodConfig): MusicPreset {
  return {
    id: mood.id,
    label: mood.label,
    description: mood.description,
    provider: mood.provider,
    embedUrl:
      mood.provider === "youtube"
        ? youtubeVideoEmbed(mood.playlistId, true)
        : spotifyEmbed(mood.playlistId),
    externalUrl:
      mood.provider === "youtube"
        ? `https://music.youtube.com/playlist?list=${mood.playlistId}`
        : `https://open.spotify.com/playlist/${mood.playlistId}`,
    gradient: mood.gradient,
    accent: mood.accent,
  };
}

export const PROVIDER_LABELS: Record<MusicProvider, string> = {
  youtube: "YouTube Music",
  spotify: "Spotify",
};
