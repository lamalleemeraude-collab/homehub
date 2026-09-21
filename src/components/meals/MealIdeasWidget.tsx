"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChefHat,
  ChevronDown,
  CookingPot,
  Heart,
  ListChecks,
  Loader2,
  RefreshCw,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { TouchButton } from "@/components/ui/TouchButton";
import type { FavoriteMenu, MenuIdea } from "@/lib/meals/menu-idea-types";
import {
  addFavoriteLocal,
  loadFavoriteMenusLocal,
  removeFavoriteLocal,
  saveFavoriteMenusLocal,
} from "@/lib/meals/favorite-menus-local";
import { ideaEmoji, ingredientEmoji } from "@/lib/meals/menu-emoji";

const CARD_TINTS = [
  "from-orange-100/80 via-white/70 to-amber-50/60",
  "from-teal-100/80 via-white/70 to-emerald-50/60",
  "from-violet-100/80 via-white/70 to-fuchsia-50/60",
] as const;

const STEP_ICONS = [CookingPot, UtensilsCrossed, ChefHat] as const;

function IdeaCard({
  idea,
  index,
  expanded,
  favorited,
  onToggleExpand,
  onToggleFavorite,
}: {
  idea: MenuIdea;
  index: number;
  expanded: boolean;
  favorited: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
}) {
  const emoji = ideaEmoji(idea);
  const tint = CARD_TINTS[index % CARD_TINTS.length];

  return (
    <motion.div
      layout
      className={`flex min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-gradient-to-br ${tint} shadow-lg shadow-slate-900/5 backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
        <button
          type="button"
          onClick={onToggleExpand}
          className="touch-target flex min-w-0 flex-1 items-start gap-3 text-left sm:gap-4"
          aria-expanded={expanded}
        >
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-3xl shadow-sm sm:h-16 sm:w-16 sm:text-4xl"
            aria-hidden
          >
            {emoji}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-xl font-medium leading-snug text-slate-900 sm:text-2xl">
              {idea.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500 sm:text-base">
              {idea.shortDescription}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-teal-800 shadow-sm">
              <ListChecks className="h-3.5 w-3.5" strokeWidth={2.5} />
              {expanded ? "Replier" : "Voir la recette"}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
                strokeWidth={2.5}
              />
            </span>
          </div>
        </button>

        <TouchButton
          ariaLabel={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
          onClick={onToggleFavorite}
          className={`touch-target flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-300 active:scale-95 ${
            favorited
              ? "bg-rose-100 ring-2 ring-rose-200"
              : "bg-white/90"
          }`}
        >
          <Heart
            className={`h-6 w-6 ${
              favorited ? "fill-rose-500 text-rose-500" : "text-slate-300"
            }`}
            strokeWidth={2.25}
          />
        </TouchButton>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/60 px-4 pb-5 pt-3 sm:px-5">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                <span aria-hidden>🧺</span> Dans le panier
              </p>
              <ul className="mb-4 flex flex-wrap gap-2">
                {idea.miniRecipe.ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    <span aria-hidden>{ingredientEmoji(ing)}</span>
                    {ing}
                  </li>
                ))}
              </ul>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                <span aria-hidden>👨‍🍳</span> En 3 gestes
              </p>
              <ol className="space-y-3">
                {idea.miniRecipe.steps.map((step, i) => {
                  const Icon = STEP_ICONS[i] ?? ChefHat;
                  return (
                    <li
                      key={i}
                      className="flex gap-3 text-base font-medium leading-snug text-slate-800"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-md shadow-teal-200/50">
                        <Icon className="h-4 w-4" strokeWidth={2.5} />
                      </span>
                      {step}
                    </li>
                  );
                })}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Kiosk repas : un gros bouton → 3 idées → cœurs / classiques. */
export function MealIdeasWidget() {
  const [ideas, setIdeas] = useState<MenuIdea[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    const local = loadFavoriteMenusLocal();
    setFavorites(local);
    try {
      const res = await fetch("/api/meals/favorites");
      if (!res.ok) return;
      const data = (await res.json()) as FavoriteMenu[];
      if (Array.isArray(data) && data.length > 0) {
        saveFavoriteMenusLocal(data);
        setFavorites(data);
      }
    } catch {
      /* localStorage suffit sur tablette / Vercel */
    }
  }, []);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  async function generate() {
    setLoading(true);
    setError(null);
    setExpandedId(null);
    try {
      const res = await fetch("/api/meals/ideas", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as MenuIdea[];
      if (!Array.isArray(data) || data.length === 0) throw new Error();
      setIdeas(data);
    } catch {
      setError("Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  function isFavorited(idea: MenuIdea) {
    return favorites.some((f) => f.id === idea.id || f.title === idea.title);
  }

  async function toggleFavorite(idea: MenuIdea) {
    const fav = favorites.find((f) => f.id === idea.id || f.title === idea.title);
    // Toujours sauver en local (tablette murale / cloud)
    const next = fav
      ? removeFavoriteLocal(fav.id)
      : addFavoriteLocal(idea);
    setFavorites(next);

    try {
      if (fav) {
        await fetch(`/api/meals/favorites?id=${encodeURIComponent(fav.id)}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/meals/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(idea),
        });
      }
    } catch {
      /* local OK */
    }
  }

  const showEmpty = !loading && ideas.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <AnimatePresence mode="wait">
        {showEmpty && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-2"
          >
            <div className="flex gap-2 text-4xl sm:text-5xl" aria-hidden>
              {["🍕", "🍝", "🥞", "🌮"].map((e, i) => (
                <motion.span
                  key={e}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            <p className="max-w-md text-center text-lg font-medium text-slate-500 sm:text-xl">
              Trois idées pour ce soir — un tap, c’est prêt.
            </p>
            <TouchButton
              ariaLabel="Générer des idées"
              onClick={() => void generate()}
              className="touch-target flex min-h-[5.5rem] w-full max-w-lg items-center justify-center gap-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 text-xl font-medium text-white shadow-xl shadow-teal-300/40 active:scale-[0.98] sm:min-h-[6rem] sm:text-2xl"
            >
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.25} />
              Générer des idées ✨
            </TouchButton>

            {favorites.length > 0 && (
              <div className="mt-2 w-full max-w-2xl">
                <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  Nos classiques
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {favorites.map((fav) => (
                    <button
                      key={fav.id}
                      type="button"
                      onClick={() => {
                        setIdeas([fav]);
                        setExpandedId(fav.id);
                      }}
                      className="touch-target inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm active:scale-[0.98]"
                    >
                      <span aria-hidden>{ideaEmoji(fav)}</span>
                      {fav.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
              <span className="absolute inset-0 flex items-center justify-center text-lg" aria-hidden>
                👨‍🍳
              </span>
            </div>
            <p className="text-lg font-medium text-slate-600">
              Le chef mitonne…
            </p>
          </motion.div>
        )}

        {!loading && ideas.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex min-h-0 flex-1 flex-col gap-3"
          >
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pb-1">
              {ideas.map((idea, index) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  index={index}
                  expanded={expandedId === idea.id}
                  favorited={isFavorited(idea)}
                  onToggleExpand={() =>
                    setExpandedId((id) => (id === idea.id ? null : idea.id))
                  }
                  onToggleFavorite={() => void toggleFavorite(idea)}
                />
              ))}

              {favorites.length > 0 && (
                <div className="pt-1">
                  <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    Nos classiques
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {favorites.map((fav) => (
                      <button
                        key={fav.id}
                        type="button"
                        onClick={() => {
                          setIdeas([fav]);
                          setExpandedId(fav.id);
                        }}
                        className="touch-target inline-flex shrink-0 items-center gap-2 rounded-full bg-white/85 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
                      >
                        <span aria-hidden>{ideaEmoji(fav)}</span>
                        {fav.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <TouchButton
              ariaLabel="Régénérer"
              onClick={() => void generate()}
              className="touch-target flex min-h-[3.5rem] w-full shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/85 text-base font-medium text-slate-700 shadow-sm active:scale-[0.99]"
            >
              <RefreshCw className="h-5 w-5" strokeWidth={2.5} />
              Autres idées 🎲
            </TouchButton>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-2 text-center text-sm font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}
