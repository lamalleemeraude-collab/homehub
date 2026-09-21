"use client";

import { useMemo, useState } from "react";
import { Headphones, Play, Radio } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { TouchButton } from "@/components/ui/TouchButton";
import { MusicPlayerOverlay } from "@/components/house/MusicPlayerOverlay";
import { YouTubeBrowserOverlay } from "@/components/house/YouTubeBrowserOverlay";
import {
  MUSIC_MOOD_PRESETS,
  getMusicPresets,
  moodToPreset,
  type MusicPreset,
} from "@/lib/music-studio";
import { YOUTUBE_HOME, type YouTubeTarget } from "@/lib/youtube-url";

function ProviderIcon({ provider }: { provider: MusicPreset["provider"] }) {
  if (provider === "youtube") {
    return (
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black text-white shadow-lg sm:h-16 sm:w-16 sm:text-3xl">
        ▶
      </span>
    );
  }
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black text-white shadow-lg sm:h-16 sm:w-16">
      ♫
    </span>
  );
}

function presetToYouTubeTarget(preset: MusicPreset): YouTubeTarget {
  return {
    embedUrl: preset.embedUrl.replace(
      "www.youtube.com/embed",
      "www.youtube-nocookie.com/embed"
    ),
    label: preset.label,
    kind: preset.embedUrl.includes("videoseries") ? "playlist" : "video",
  };
}

export function MusicStudioPanel() {
  const [youtubeInitial, setYoutubeInitial] = useState<YouTubeTarget | null>(
    null
  );
  const [spotifyPreset, setSpotifyPreset] = useState<MusicPreset | null>(null);

  const mainPresets = useMemo(() => getMusicPresets(), []);
  const moodPresets = useMemo(
    () => MUSIC_MOOD_PRESETS.map(moodToPreset),
    []
  );

  function openPreset(preset: MusicPreset) {
    if (preset.provider === "youtube") {
      setYoutubeInitial(
        preset.id === "youtube-main" ? YOUTUBE_HOME : presetToYouTubeTarget(preset)
      );
    } else {
      setSpotifyPreset(preset);
    }
  }

  return (
    <>
      <BentoCard
        variant="gradient"
        gradient="from-violet-600 via-purple-600 to-fuchsia-700"
        className="flex h-full min-h-[280px] flex-col overflow-hidden p-5 sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Headphones className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                Studio Musique
              </p>
            </div>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Lance ta musique
            </h2>
            <p className="mt-1 text-sm font-semibold text-white/80 sm:text-base">
              YouTube intégré avec recherche · Spotify en lecture
            </p>
          </div>
          <Radio className="hidden h-8 w-8 shrink-0 text-white/30 sm:block" strokeWidth={1.5} />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mainPresets.map((preset) => (
            <TouchButton
              key={preset.id}
              ariaLabel={`Lancer ${preset.label}`}
              onClick={() => openPreset(preset)}
              className={`touch-target flex min-h-[100px] items-center gap-4 rounded-2xl bg-gradient-to-br ${preset.gradient} p-4 shadow-xl shadow-black/20 active:scale-[0.98] sm:min-h-[120px] sm:p-5`}
            >
              <ProviderIcon provider={preset.provider} />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xl font-black text-white sm:text-2xl">
                  {preset.label}
                </p>
                <p className="text-sm font-semibold text-white/80">
                  {preset.provider === "youtube"
                    ? "Recherche & navigation dans le Hub"
                    : preset.description}
                </p>
              </div>
              <Play className="h-8 w-8 shrink-0 fill-white text-white sm:h-9 sm:w-9" strokeWidth={0} />
            </TouchButton>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">
            Ambiances rapides
          </p>
          <div className="grid grid-cols-3 gap-2">
            {moodPresets.map((preset) => (
              <TouchButton
                key={preset.id}
                ariaLabel={`Ambiance ${preset.label}`}
                onClick={() => openPreset(preset)}
                className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-white/20 bg-white/10 px-2 py-3 active:bg-white/20"
              >
                <span className="text-base font-black text-white sm:text-lg">
                  {preset.label}
                </span>
                <span className="text-[10px] font-semibold text-white/70 sm:text-xs">
                  {preset.description}
                </span>
              </TouchButton>
            ))}
          </div>
        </div>
      </BentoCard>

      {youtubeInitial && (
        <YouTubeBrowserOverlay
          initial={youtubeInitial}
          onClose={() => setYoutubeInitial(null)}
        />
      )}

      {spotifyPreset && (
        <MusicPlayerOverlay
          preset={spotifyPreset}
          onClose={() => setSpotifyPreset(null)}
        />
      )}
    </>
  );
}
