import { resolveProductInput } from "@/lib/shopping-product-icon";

/** Devine un emoji plat à partir du titre / description. */
export function mealEmojiFromTitle(title: string, fallback = "🍽️"): string {
  const t = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (t.includes("pizza") || t.includes("naan")) return "🍕";
  if (t.includes("pate") || t.includes("penne") || t.includes("spaghetti")) return "🍝";
  if (t.includes("gnocchi")) return "🥔";
  if (t.includes("galette") || t.includes("crepe")) return "🥞";
  if (t.includes("quesadilla") || t.includes("tortilla") || t.includes("wrap")) return "🌮";
  if (t.includes("croque") || t.includes("sandwich")) return "🥪";
  if (t.includes("burger")) return "🍔";
  if (t.includes("salade")) return "🥗";
  if (t.includes("soupe") || t.includes("veloute")) return "🍲";
  if (t.includes("riz") || t.includes("wok")) return "🍚";
  if (t.includes("omelette") || t.includes("oeuf")) return "🍳";
  if (t.includes("poisson") || t.includes("saumon")) return "🐟";
  if (t.includes("poulet")) return "🍗";
  if (t.includes("taco")) return "🌮";
  if (t.includes("lasagne")) return "🍝";
  return fallback;
}

export function ingredientEmoji(name: string): string {
  return resolveProductInput(name).emoji || "🥗";
}

export function ideaEmoji(idea: { title: string; emoji?: string }): string {
  if (idea.emoji && idea.emoji.trim()) return idea.emoji.trim();
  return mealEmojiFromTitle(idea.title);
}
