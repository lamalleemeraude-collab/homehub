"use client";

import { X } from "lucide-react";
import { TouchButton } from "@/components/ui/TouchButton";
import {
  PROVIDER_LABELS,
  type MusicPreset,
} from "@/lib/music-studio";

type MusicPlayerOverlayProps = {
  preset: MusicPreset;
  onClose: () => void;
};

export function MusicPlayerOverlay({ preset, onClose }: MusicPlayerOverlayProps) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-900">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-700/60 bg-slate-900 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Studio Musique — {PROVIDER_LABELS[preset.provider]}
          </p>
          <h2 className="truncate text-lg font-black text-white sm:text-xl">
            {preset.label}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={preset.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target hidden rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white active:bg-white/20 sm:inline-flex sm:items-center"
          >
            Ouvrir l&apos;app
          </a>
          <TouchButton
            ariaLabel="Fermer le lecteur"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 active:bg-white/20"
          >
            <X className="h-7 w-7 text-white" strokeWidth={2.5} />
          </TouchButton>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 bg-black">
        <iframe
          key={preset.embedUrl}
          src={preset.embedUrl}
          title={`${preset.label} — ${PROVIDER_LABELS[preset.provider]}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
