import type { MenuIdea } from "./menu-idea-types";
import { mealEmojiFromTitle } from "./menu-emoji";

const SPIRIT =
  "Dans l'esprit de menus familiaux simples et gourmands type « Soirée pizza » ou « Pâtes jambon » : confort, peu d'ingrédients, prêt vite.";

/** Variantes locales si pas d'OpenAI */
const FALLBACK_POOL: MenuIdea[] = [
  {
    id: "idea-pizza-blanche",
    title: "Soirée pizza blanche",
    emoji: "🍕",
    shortDescription: "Crème, mozzarella et champignons — croustillante et fondante.",
    miniRecipe: {
      ingredients: [
        "Pâte à pizza",
        "Crème fraîche",
        "Mozzarella",
        "Champignons",
        "Origan",
      ],
      steps: [
        "Étaler la pâte, napper de crème.",
        "Ajouter fromage et champignons.",
        "Enfourner 12–15 min à 220°C.",
      ],
    },
  },
  {
    id: "idea-pates-jambon",
    title: "Pâtes jambon crème",
    emoji: "🍝",
    shortDescription: "Le classique express : pâtes, dés de jambon, crème.",
    miniRecipe: {
      ingredients: ["Pâtes", "Jambon", "Crème fraîche", "Parmesan", "Poivre"],
      steps: [
        "Cuire les pâtes al dente.",
        "Faire revenir le jambon, ajouter la crème.",
        "Mélanger avec les pâtes et le parmesan.",
      ],
    },
  },
  {
    id: "idea-galette-jambon",
    title: "Galettes jambon-fromage",
    emoji: "🥞",
    shortDescription: "Façon crêperie : chaudes, fondantes, prêtes en 10 min.",
    miniRecipe: {
      ingredients: [
        "Galettes de sarrasin",
        "Jambon",
        "Emmental",
        "Œuf (optionnel)",
        "Beurre",
      ],
      steps: [
        "Chauffer la galette au beurre.",
        "Déposer jambon et fromage.",
        "Plier et servir bien chaud.",
      ],
    },
  },
  {
    id: "idea-pizza-tomate",
    title: "Mini-pizzas tomate & jambon",
    emoji: "🍕",
    shortDescription: "Sur pain ou naan : version ultra-rapide du vendredi soir.",
    miniRecipe: {
      ingredients: ["Naan ou pain", "Sauce tomate", "Jambon", "Mozzarella", "Basilic"],
      steps: [
        "Étaler la sauce sur le pain.",
        "Garnir jambon + fromage.",
        "Griller 8 min au four.",
      ],
    },
  },
  {
    id: "idea-croque",
    title: "Croque-monsieur four",
    emoji: "🥪",
    shortDescription: "Pain, jambon, fromage — le réconfort en plaque.",
    miniRecipe: {
      ingredients: ["Pain de mie", "Jambon", "Emmental", "Beurre", "Lait (béchamel light)"],
      steps: [
        "Beurrer le pain, empiler jambon-fromage.",
        "Napper d'un filet de lait/fromage.",
        "Enfourner 10 min jusqu'à doré.",
      ],
    },
  },
  {
    id: "idea-penne-tomate",
    title: "Penne tomate mozzarella",
    emoji: "🍝",
    shortDescription: "Comme une pizza en bol : sauce, pâtes, fromage fondant.",
    miniRecipe: {
      ingredients: [
        "Penne",
        "Tomates concassées",
        "Mozzarella",
        "Ail",
        "Huile d'olive",
      ],
      steps: [
        "Cuire les penne.",
        "Mijoter sauce tomate-ail 8 min.",
        "Mélanger, ajouter mozzarella en dés.",
      ],
    },
  },
  {
    id: "idea-quesadilla",
    title: "Quesadillas jambon-fromage",
    emoji: "🌮",
    shortDescription: "Tortillas croustillantes, cœur fondant — finger food familiale.",
    miniRecipe: {
      ingredients: ["Tortillas", "Jambon", "Fromage râpé", "Beurre ou huile", "Salade"],
      steps: [
        "Garnir tortillas, plier.",
        "Dorer à la poêle 2 min/face.",
        "Couper en parts, servir avec salade.",
      ],
    },
  },
  {
    id: "idea-gnocchi",
    title: "Gnocchis poêle crème & jambon",
    emoji: "🧈",
    shortDescription: "Sans eau qui bout trop longtemps : tout se fait à la poêle.",
    miniRecipe: {
      ingredients: ["Gnocchis", "Jambon", "Crème", "Parmesan", "Persil"],
      steps: [
        "Faire dorer les gnocchis à la poêle.",
        "Ajouter jambon et crème 3 min.",
        "Parmesan + persil, servir.",
      ],
    },
  },
];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeIdea(raw: Partial<MenuIdea>, index: number): MenuIdea | null {
  if (!raw.title || !raw.shortDescription || !raw.miniRecipe) return null;
  const ingredients = Array.isArray(raw.miniRecipe.ingredients)
    ? raw.miniRecipe.ingredients.filter((x): x is string => typeof x === "string").slice(0, 5)
    : [];
  const steps = Array.isArray(raw.miniRecipe.steps)
    ? raw.miniRecipe.steps.filter((x): x is string => typeof x === "string").slice(0, 3)
    : [];
  if (ingredients.length < 3 || steps.length < 2) return null;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `idea-${Date.now()}-${index}`,
    title: String(raw.title).trim(),
    shortDescription: String(raw.shortDescription).trim(),
    emoji:
      typeof raw.emoji === "string" && raw.emoji.trim()
        ? raw.emoji.trim()
        : mealEmojiFromTitle(String(raw.title)),
    miniRecipe: {
      ingredients: ingredients.slice(0, 5),
      steps: steps.slice(0, 3),
    },
  };
}

function buildFallbackIdeas(): MenuIdea[] {
  return shuffle(FALLBACK_POOL)
    .slice(0, 3)
    .map((idea, i) => ({
      ...idea,
      id: `${idea.id}-${Date.now()}-${i}`,
    }));
}

const SYSTEM_PROMPT = `Tu es un chef famille français. ${SPIRIT}
Réponds UNIQUEMENT avec un JSON valide : un tableau de exactement 3 objets.
Chaque objet a exactement ces champs :
{
  "id": "slug-unique",
  "title": "titre court du menu",
  "emoji": "un seul emoji alimentaire (🍕🍝🥞🌮🥪…)",
  "shortDescription": "une phrase appétissante",
  "miniRecipe": {
    "ingredients": ["4 ou 5 ingrédients clés"],
    "steps": ["étape 1 ultra-courte", "étape 2", "étape 3"]
  }
}
Invente 3 variations nouvelles (pas de copies exactes). Ingrédients en français. Pas de markdown.`;

export async function generateMenuIdeas(): Promise<{
  ideas: MenuIdea[];
  source: "openai" | "fallback";
}> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { ideas: buildFallbackIdeas(), source: "fallback" };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.95,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content:
              'Génère 3 idées. Réponds avec {"ideas":[...]} contenant le tableau des 3 objets.',
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    const parsed = JSON.parse(content) as
      | Partial<MenuIdea>[]
      | { ideas?: Partial<MenuIdea>[]; menus?: Partial<MenuIdea>[] };

    const list: Partial<MenuIdea>[] = Array.isArray(parsed)
      ? parsed
      : (parsed.ideas ?? parsed.menus ?? []);

    const ideas = list
      .map((item, i) => normalizeIdea(item, i))
      .filter((x): x is MenuIdea => x != null)
      .slice(0, 3);

    if (ideas.length < 3) throw new Error("Pas assez d'idées");

    return { ideas, source: "openai" };
  } catch {
    return { ideas: buildFallbackIdeas(), source: "fallback" };
  }
}
