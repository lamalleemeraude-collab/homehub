"use client";

import { useCallback, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Search,
  X,
} from "lucide-react";
import { TouchButton } from "@/components/ui/TouchButton";
import {
  YOUTUBE_HOME,
  buildVideoTarget,
  formatDuration,
  parseYouTubeInput,
  type YouTubeSearchResult,
  type YouTubeTarget,
} from "@/lib/youtube-url";

type HistoryEntry = YouTubeTarget & { id: string };

type BrowserHistory = {
  entries: HistoryEntry[];
  index: number;
};

type YouTubeBrowserOverlayProps = {
  initial?: YouTubeTarget;
  onClose: () => void;
};

function targetFromSearchResult(result: YouTubeSearchResult): YouTubeTarget {
  return buildVideoTarget(result.videoId, result.title);
}

export function YouTubeBrowserOverlay({
  initial = YOUTUBE_HOME,
  onClose,
}: YouTubeBrowserOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [browser, setBrowser] = useState<BrowserHistory>(() => ({
    entries: [{ ...initial, id: "home-0" }],
    index: 0,
  }));
  const [mode, setMode] = useState<"player" | "search">("player");
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>(
    []
  );
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);

  const current =
    browser.entries[browser.index] ??
    browser.entries[browser.entries.length - 1] ??
    { ...YOUTUBE_HOME, id: "fallback" };

  const navigateTo = useCallback((target: YouTubeTarget) => {
    setBrowser((prev) => {
      const nextEntries = [
        ...prev.entries.slice(0, prev.index + 1),
        { ...target, id: `${Date.now()}-${prev.index + 1}` },
      ];
      return { entries: nextEntries, index: nextEntries.length - 1 };
    });
    setMode("player");
    setSearchResults([]);
  }, []);

  function goBack() {
    setBrowser((prev) =>
      prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev
    );
  }

  function goForward() {
    setBrowser((prev) =>
      prev.index < prev.entries.length - 1
        ? { ...prev, index: prev.index + 1 }
        : prev
    );
  }

  function goHome() {
    navigateTo(YOUTUBE_HOME);
  }

  function handleGo() {
    const parsed = parseYouTubeInput(inputValue);
    if (parsed) {
      navigateTo(parsed);
      setInputValue("");
      return;
    }
    void runSearch(inputValue);
  }

  async function runSearch(query: string) {
    const q = query.trim();
    if (!q) return;

    setSearching(true);
    setSearchFailed(false);
    setLastSearchQuery(q);
    setMode("search");

    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(q)}`,
        { cache: "no-store" }
      );
      const data = (await res.json()) as {
        results?: YouTubeSearchResult[];
        error?: string;
      };
      setSearchResults(data.results ?? []);
      setSearchFailed(!res.ok || Boolean(data.error));
    } catch {
      setSearchResults([]);
      setSearchFailed(true);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-950">
      <header className="shrink-0 space-y-2 border-b border-slate-800 px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="flex shrink-0 items-center gap-1">
            <TouchButton
              ariaLabel="Retour"
              onClick={goBack}
              disabled={browser.index === 0}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 disabled:opacity-30 active:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5 text-white" strokeWidth={2.5} />
            </TouchButton>
            <TouchButton
              ariaLabel="Suivant"
              onClick={goForward}
              disabled={browser.index >= browser.entries.length - 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 disabled:opacity-30 active:bg-white/20"
            >
              <ArrowRight className="h-5 w-5 text-white" strokeWidth={2.5} />
            </TouchButton>
            <TouchButton
              ariaLabel="Accueil YouTube"
              onClick={goHome}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 active:bg-white/20"
            >
              <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
            </TouchButton>
          </div>

          <form
            className="flex min-w-0 flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleGo();
            }}
          >
            <input
              ref={inputRef}
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Rechercher ou coller un lien YouTube…"
              className="min-h-[40px] flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-red-500/60 sm:min-h-[44px] sm:px-4 sm:text-base"
              autoComplete="off"
              enterKeyHint="search"
            />
            <TouchButton
              ariaLabel="Rechercher ou ouvrir"
              onClick={handleGo}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 active:bg-red-700 sm:h-11 sm:w-11"
            >
              <Search className="h-5 w-5 text-white" strokeWidth={2.5} />
            </TouchButton>
          </form>

          <TouchButton
            ariaLabel="Fermer YouTube"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 active:bg-white/20 sm:h-11 sm:w-11"
          >
            <X className="h-5 w-5 text-white" strokeWidth={2.5} />
          </TouchButton>
        </div>

        <p className="truncate px-1 text-xs font-semibold text-slate-400">
          {mode === "search"
            ? `Résultats pour « ${lastSearchQuery || "…"} »`
            : current.label}
        </p>
      </header>

      <div className="relative min-h-0 flex-1 bg-black">
        {mode === "player" ? (
          <iframe
            key={current.id}
            src={current.embedUrl}
            title={current.label}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="kiosk-scroll absolute inset-0 overflow-y-auto p-3 sm:p-4">
            {searching && (
              <p className="py-8 text-center text-sm font-semibold text-slate-400">
                Recherche en cours…
              </p>
            )}

            {!searching && searchFailed && (
              <div className="py-8 text-center">
                <p className="text-sm font-semibold text-slate-400">
                  Recherche indisponible pour le moment
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Colle un lien YouTube dans la barre ci-dessus
                </p>
                <TouchButton
                  ariaLabel="Réessayer la recherche"
                  onClick={() => void runSearch(lastSearchQuery)}
                  className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white active:bg-white/20"
                >
                  Réessayer
                </TouchButton>
              </div>
            )}

            {!searching && !searchFailed && searchResults.length === 0 && lastSearchQuery && (
              <p className="py-8 text-center text-sm font-semibold text-slate-400">
                Aucune vidéo pour « {lastSearchQuery} »
              </p>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {searchResults.map((result) => (
                  <TouchButton
                    key={result.videoId}
                    ariaLabel={result.title}
                    onClick={() => navigateTo(targetFromSearchResult(result))}
                    className="flex gap-3 rounded-2xl bg-slate-900 p-3 text-left active:bg-slate-800 sm:p-4"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${result.videoId}/mqdefault.jpg`}
                      alt=""
                      className="h-16 w-28 shrink-0 rounded-lg object-cover sm:h-20 sm:w-32"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-black text-white sm:text-base">
                        {result.title}
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                        {result.author}
                        {result.lengthSeconds > 0 &&
                          ` · ${formatDuration(result.lengthSeconds)}`}
                      </p>
                    </div>
                  </TouchButton>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
