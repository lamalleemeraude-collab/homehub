"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChefHat,
  Loader2,
  Plus,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { TouchButton } from "@/components/ui/TouchButton";
import type {
  ChefGenerateResponse,
  RecipeProposal,
  SavedChefMeal,
} from "@/lib/meals/chef-types";
import {
  addPantryItem,
  loadLastChefMeal,
  loadPantry,
  removePantryItem,
  saveLastChefMeal,
} from "@/lib/meals/pantry-storage";
import { recipeMissingToShoppingItems } from "@/lib/meals/recipe-to-shopping";
import { updateDayMeals, todayDayIndex } from "@/lib/meals/storage";
import {
  loadShoppingItems,
  saveShoppingItems,
} from "@/lib/shopping-storage";
import { resolveProductInput } from "@/lib/shopping-product-icon";
import { PASTEL_GRADIENTS } from "@/lib/ui/pastel-theme";
import { RecipeCookingMode } from "@/components/meals/RecipeCookingMode";

const CRAVING_CHIPS = [
  "Rapide ⚡",
  "Léger 🥗",
  "Réconfortant 🧀",
  "Pâtes 🍝",
  "Végé 🥬",
  "Surprise ✨",
];

function RecipeCard({
  recipe,
  selected,
  onSelect,
}: {
  recipe: RecipeProposal;
  selected: boolean;
  onSelect: () => void;
}) {
  const toBuy = recipe.ingredients.filter((i) => i.status === "to_buy").length;
  const available = recipe.ingredients.filter(
    (i) => i.status === "available"
  ).length;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full flex-col rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
        selected
          ? "border-emerald-400 bg-white ring-2 ring-emerald-200/60"
          : "border-white/60 bg-white/75 hover:bg-white/90"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden>
          {recipe.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-slate-900">
            {recipe.title}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">{recipe.description}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
              {recipe.prepMinutes} min
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              {available} au frigo
            </span>
            {toBuy > 0 && (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">
                {toBuy} à acheter
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function RecipeDetail({ recipe }: { recipe: RecipeProposal }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/50 px-4 py-3">
        <p className="text-sm font-semibold text-emerald-900">
          💡 {recipe.chefTip}
        </p>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Ingrédients
        </h4>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li
              key={`${ing.name}-${i}`}
              className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm"
            >
              <span aria-hidden>
                {ing.status === "available"
                  ? "✅"
                  : ing.status === "to_buy"
                    ? "🛒"
                    : "○"}
              </span>
              <span className="font-semibold text-slate-800">{ing.name}</span>
              <span className="ml-auto text-slate-500">{ing.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Étapes
        </h4>
        <ol className="space-y-2">
          {recipe.steps.map((step, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-white/50 bg-white/70 px-3 py-2.5 text-sm leading-relaxed text-slate-700"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function ChefGenerator() {
  const [pantry, setPantry] = useState<string[]>([]);
  const [pantryDraft, setPantryDraft] = useState("");
  const [craving, setCraving] = useState("");
  const [mealType, setMealType] = useState<"midi" | "soir">("soir");
  const [quickShopOk, setQuickShopOk] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ChefGenerateResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastMeal, setLastMeal] = useState<SavedChefMeal | null>(null);
  const [savedHint, setSavedHint] = useState<string | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<RecipeProposal | null>(null);

  useEffect(() => {
    setPantry(loadPantry());
    setLastMeal(loadLastChefMeal());
  }, []);

  const selectedRecipe =
    result?.recipes.find((r) => r.id === selectedId) ?? result?.recipes[0];

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedId(null);

    try {
      const res = await fetch("/api/meals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          craving,
          pantry,
          quickShopOk,
          mealType,
          servings: 4,
        }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const data = (await res.json()) as ChefGenerateResponse;
      setResult(data);
      if (data.recipes[0]) setSelectedId(data.recipes[0].id);
    } catch {
      setError("Le chef est occupé… réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  function addPantry() {
    const next = addPantryItem(pantryDraft);
    setPantry(next);
    setPantryDraft("");
  }

  function removePantry(item: string) {
    setPantry(removePantryItem(item));
  }

  function saveRecipeToPlan() {
    if (!selectedRecipe) return;

    const meal: SavedChefMeal = {
      recipe: selectedRecipe,
      savedAt: new Date().toISOString(),
      mealType,
    };
    saveLastChefMeal(meal);
    setLastMeal(meal);

    const dayIdx = todayDayIndex();
    updateDayMeals(dayIdx, {
      [mealType]: selectedRecipe.title,
      ingredients: selectedRecipe.ingredients
        .filter((i) => i.status === "to_buy")
        .map((i) => i.name),
    });
  }

  function startCooking() {
    if (!selectedRecipe) return;
    saveRecipeToPlan();
    setCookingRecipe(selectedRecipe);
  }

  function addMissingToShopping() {
    if (!selectedRecipe) return;
    const existing = loadShoppingItems() ?? [];
    const added = recipeMissingToShoppingItems(selectedRecipe, existing);
    if (added.length === 0) {
      setSavedHint("Rien à ajouter — tu as tout !");
    } else {
      saveShoppingItems([...existing, ...added]);
      setSavedHint(`${added.length} article(s) ajouté(s) aux courses`);
    }
    setTimeout(() => setSavedHint(null), 2500);
  }

  return (
    <>
      {cookingRecipe && (
        <RecipeCookingMode
          recipe={cookingRecipe}
          onClose={() => {
            setCookingRecipe(null);
            setSavedHint("Recette enregistrée !");
            setTimeout(() => setSavedHint(null), 2500);
          }}
          onComplete={() => {
            setSavedHint("Bon appétit !");
          }}
        />
      )}

      <div className="flex flex-col gap-3 sm:gap-4">
      <BentoCard className="shrink-0 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🧊
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Ton frigo & dispo</h2>
            <p className="text-xs text-slate-500">Ce que tu as sous la main</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pantry.map((item) => {
            const emoji = resolveProductInput(item).emoji;
            return (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/80 py-1 pl-2.5 pr-1 text-sm font-semibold text-slate-700"
              >
                <span aria-hidden>{emoji}</span>
                {item}
                <button
                  type="button"
                  onClick={() => removePantry(item)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 active:bg-slate-100"
                  aria-label={`Retirer ${item}`}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </span>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={pantryDraft}
            onChange={(e) => setPantryDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPantry();
              }
            }}
            placeholder="Ajouter au frigo…"
            className="min-w-0 flex-1 rounded-xl border border-white/70 bg-white/80 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <TouchButton
            ariaLabel="Ajouter au frigo"
            onClick={addPantry}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/80 text-emerald-700 shadow-sm"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </TouchButton>
        </div>
      </BentoCard>

      <BentoCard
        variant="gradient"
        gradient={PASTEL_GRADIENTS.canteen}
        className="shrink-0 p-4 sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 shadow-sm">
            <ChefHat className="h-5 w-5 text-emerald-700" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Qu&apos;est-ce qui te ferait plaisir ?
            </h2>
            <p className="text-xs text-slate-500">Ton binôme chef propose 3 idées</p>
          </div>
        </div>

        <textarea
          value={craving}
          onChange={(e) => setCraving(e.target.value)}
          placeholder="Ex : léger avec des œufs, réconfortant, pâtes crémeuses…"
          rows={2}
          className="w-full resize-none rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-base font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-200"
        />

        <div className="mt-2 flex flex-wrap gap-2">
          {CRAVING_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() =>
                setCraving((prev) => (prev ? `${prev}, ${chip}` : chip))
              }
              className="rounded-full border border-white/60 bg-white/60 px-3 py-1.5 text-xs font-bold text-slate-600 active:bg-white"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-white/60 bg-white/50 p-0.5">
            {(["midi", "soir"] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setMealType(slot)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${
                  mealType === slot
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={quickShopOk}
              onChange={(e) => setQuickShopOk(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            OK pour 2–3 courses rapides
          </label>
        </div>

        <TouchButton
          ariaLabel="Générer des recettes"
          onClick={() => void generate()}
          disabled={loading}
          className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-bold text-white shadow-md disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Le chef réfléchit…
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" strokeWidth={2.5} />
              Propose-moi 3 recettes
            </>
          )}
        </TouchButton>

        {error && (
          <p className="mt-2 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        {result?.message && (
          <p className="mt-2 text-center text-xs font-medium text-slate-500">
            {result.message}
          </p>
        )}
      </BentoCard>

      {result && result.recipes.length > 0 && (
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Choisis ta recette
            </h3>
            {result.recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                selected={selectedRecipe?.id === recipe.id}
                onSelect={() => setSelectedId(recipe.id)}
              />
            ))}
          </div>

          {selectedRecipe && (
            <BentoCard className="min-h-0 overflow-y-auto p-4 sm:p-5">
              <span className="text-2xl" aria-hidden>
                {selectedRecipe.emoji}
              </span>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {selectedRecipe.title}
              </h3>
              <div className="mt-4">
                <RecipeDetail recipe={selectedRecipe} />
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <TouchButton
                  ariaLabel="Lancer le mode cuisine"
                  onClick={startCooking}
                  className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md"
                >
                  C&apos;est parti ! 🍽️
                </TouchButton>
                <TouchButton
                  ariaLabel="Ajouter les ingrédients manquants aux courses"
                  onClick={addMissingToShopping}
                  className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/80 text-sm font-bold text-orange-800 shadow-sm"
                >
                  <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
                  Courses manquantes
                </TouchButton>
              </div>
              {savedHint && (
                <p className="mt-2 text-center text-sm font-semibold text-emerald-600">
                  {savedHint}
                </p>
              )}
            </BentoCard>
          )}
        </div>
      )}

      {lastMeal && !result && (
        <BentoCard className="shrink-0 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dernière recette choisie
          </p>
          <p className="mt-1 text-base font-bold text-slate-800">
            {lastMeal.recipe.emoji} {lastMeal.recipe.title}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <TouchButton
              ariaLabel="Reprendre la cuisine"
              onClick={() => setCookingRecipe(lastMeal.recipe)}
              className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-md"
            >
              Reprendre la cuisine 👨‍🍳
            </TouchButton>
            <Link
              href="/shopping"
              className="inline-flex items-center rounded-xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-bold text-orange-700 shadow-sm"
            >
              Courses →
            </Link>
          </div>
        </BentoCard>
      )}
      </div>
    </>
  );
}
