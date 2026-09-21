import type {
  ChefGenerateRequest,
  ChefGenerateResponse,
  RecipeProposal,
} from "./chef-types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pantryHas(pantry: string[], ...keywords: string[]): boolean {
  const norm = pantry.map(normalize);
  return keywords.some((kw) =>
    norm.some((p) => p.includes(normalize(kw)) || normalize(kw).includes(p))
  );
}

function ing(
  name: string,
  quantity: string,
  pantry: string[],
  quickShopOk: boolean
): RecipeProposal["ingredients"][number] {
  const has = pantryHas(pantry, name);
  return {
    name,
    quantity,
    status: has ? "available" : quickShopOk ? "to_buy" : "optional",
  };
}

function buildFallbackRecipes(req: ChefGenerateRequest): RecipeProposal[] {
  const { pantry, craving, quickShopOk, servings } = req;
  const n = normalize(craving);
  const recipes: RecipeProposal[] = [];

  const wantsPasta =
    n.includes("pate") || n.includes("italien") || pantryHas(pantry, "pates");
  const wantsLight =
    n.includes("leger") || n.includes("salade") || n.includes("frais");
  const wantsComfort =
    n.includes("reconfort") || n.includes("gratin") || n.includes("chaud");
  const wantsQuick =
    n.includes("rapide") || n.includes("vite") || n.includes("30");

  if (wantsPasta || pantryHas(pantry, "pates", "tomate")) {
    recipes.push({
      id: "fb-pasta",
      title: "Pâtes express tomate & basilic",
      emoji: "🍝",
      description: "Un classique familial, prêt en un clin d'œil.",
      prepMinutes: wantsQuick ? 18 : 25,
      difficulty: "facile",
      ingredients: [
        ing("Pâtes", `${servings * 80} g`, pantry, quickShopOk),
        ing("Tomates", "400 g", pantry, quickShopOk),
        ing("Ail", "2 gousses", pantry, quickShopOk),
        ing("Huile d'olive", "2 c. à soupe", pantry, quickShopOk),
        ing("Basilic", "quelques feuilles", pantry, quickShopOk),
        ing("Parmesan", "au goût", pantry, quickShopOk),
      ],
      steps: [
        "Faire bouillir une grande casserole d'eau salée pour les pâtes.",
        "Couper les tomates en dés, faire revenir l'ail dans l'huile 1 min.",
        "Ajouter les tomates, laisser mijoter 8–10 min à feu doux.",
        "Cuire les pâtes al dente, les égoutter en gardant un peu d'eau.",
        "Mélanger pâtes et sauce, basilic et parmesan. Servir tout de suite.",
      ],
      chefTip: "Un filet d'huile d'olive cru au moment de servir, c'est la touche chef.",
    });
  }

  if (wantsLight || pantryHas(pantry, "oeuf", "salade")) {
    recipes.push({
      id: "fb-omelette",
      title: "Omelette baveuse & salade croquante",
      emoji: "🥚",
      description: "Léger, protéiné, parfait quand on manque de temps.",
      prepMinutes: 15,
      difficulty: "facile",
      ingredients: [
        ing("Œufs", `${servings * 2}`, pantry, quickShopOk),
        ing("Beurre", "20 g", pantry, quickShopOk),
        ing("Salade", "1 sachet", pantry, quickShopOk),
        ing("Fromage", "50 g", pantry, quickShopOk),
        ing("Crème", "2 c. à soupe", pantry, quickShopOk),
      ],
      steps: [
        "Battre les œufs avec une pincée de sel et du poivre.",
        "Faire fondre le beurre à feu moyen dans une poêle antiadhésive.",
        "Verser les œufs, remuer doucement au centre pour une texture baveuse.",
        "Ajouter le fromage râpé, plier l'omelette en deux.",
        "Servir avec la salade assaisonnée d'huile et citron.",
      ],
      chefTip: "Feu moyen-doux : une omelette n'aime pas la précipitation.",
    });
  }

  if (wantsComfort || pantryHas(pantry, "pomme de terre", "riz")) {
    recipes.push({
      id: "fb-gratin",
      title: "Gratin dauphinois express",
      emoji: "🥔",
      description: "Crémeux et réconfortant — idéal pour le soir.",
      prepMinutes: 45,
      difficulty: "moyen",
      ingredients: [
        ing("Pommes de terre", `${servings * 200} g`, pantry, quickShopOk),
        ing("Crème", "25 cl", pantry, quickShopOk),
        ing("Lait", "10 cl", pantry, quickShopOk),
        ing("Ail", "1 gousse", pantry, quickShopOk),
        ing("Muscade", "pincée", pantry, quickShopOk),
        ing("Fromage râpé", "50 g", pantry, quickShopOk),
      ],
      steps: [
        "Préchauffer le four à 180 °C.",
        "Éplucher et couper les pommes de terre en fines rondelles.",
        "Frotter le plat avec l'ail, disposer les pommes de terre en couches.",
        "Mélanger crème, lait, sel, poivre, muscade. Verser sur les pommes de terre.",
        "Enfourner 35–40 min jusqu'à ce que le dessus soit bien doré.",
      ],
      chefTip: "Laisse reposer 5 min avant de servir — la crème se fixe mieux.",
    });
  }

  recipes.push({
    id: "fb-onepan",
    title: "Poêlée du frigo",
    emoji: "🥘",
    description: req.craving.trim()
      ? `Inspiré de : « ${req.craving.trim()} »`
      : "On utilise ce qu'on a sous la main, zéro gaspi.",
    prepMinutes: 22,
    difficulty: "facile",
    ingredients: [
      ing("Légumes variés", "ce qu'il reste", pantry, false),
      ing("Œufs ou poulet", `${servings} portion(s)`, pantry, quickShopOk),
      ing("Riz ou pâtes", `${servings * 70} g`, pantry, quickShopOk),
      ing("Sauce tomate ou crème", "1 base", pantry, quickShopOk),
      ing("Épices", "au choix", pantry, false),
    ],
    steps: [
      "Faire revenir l'oignon et l'ail dans un peu d'huile.",
      "Ajouter la protéine (œufs battus, poulet…) et cuire 5 min.",
      "Incorporer les légumes coupés, assaisonner généreusement.",
      "Ajouter riz/pâtes cuits ou sauce, mélanger 3–4 min.",
      "Goûter, ajuster sel/poivre, servir bien chaud.",
    ],
    chefTip: "Ton frigo est ton meilleur livre de recettes — improvise sans stress.",
  });

  if (recipes.length < 3) {
    recipes.push({
      id: "fb-soup",
      title: "Soupe veloutée minute",
      emoji: "🍲",
      description: "Réchauffant, facile, et toujours une bonne idée.",
      prepMinutes: 20,
      difficulty: "facile",
      ingredients: [
        ing("Légumes", "500 g", pantry, quickShopOk),
        ing("Bouillon", "50 cl", pantry, quickShopOk),
        ing("Crème", "2 c. à soupe", pantry, quickShopOk),
        ing("Pain", "tranches", pantry, quickShopOk),
      ],
      steps: [
        "Éplucher et couper les légumes en morceaux.",
        "Faire revenir 3 min dans une cocotte avec un filet d'huile.",
        "Couvrir de bouillon, cuire 15 min jusqu'à tendreté.",
        "Mixer finement, ajouter la crème, rectifier l'assaisonnement.",
        "Servir avec des croûtons de pain.",
      ],
      chefTip: "Un tour de moulin à poivre et c'est restaurant.",
    });
  }

  return recipes.slice(0, 3);
}

const CHEF_SYSTEM = `Tu es un chef binôme français, chaleureux et pratique, pour une famille à Saint-Lunaire.
Tu proposes des recettes réalistes avec ce qu'il y a dans le frigo, en indiquant clairement ce qu'il faut racheter si besoin.
Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "recipes": [
    {
      "id": "unique-id",
      "title": "string",
      "emoji": "un seul emoji",
      "description": "une phrase accrocheuse",
      "prepMinutes": number,
      "difficulty": "facile" | "moyen",
      "ingredients": [
        { "name": "string", "quantity": "string", "status": "available" | "to_buy" | "optional" }
      ],
      "steps": ["étape 1", "étape 2", ...],
      "chefTip": "conseil du chef en une phrase"
    }
  ]
}
Propose exactement 3 recettes différentes. Ingrédients en français. Steps courts et actionnables.`;

export async function generateChefRecipes(
  req: ChefGenerateRequest
): Promise<ChefGenerateResponse> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      recipes: buildFallbackRecipes(req),
      source: "fallback",
      message: "Mode chef local (ajoute OPENAI_API_KEY pour l'IA complète)",
    };
  }

  const userPrompt = `Repas: ${req.mealType}, ${req.servings} personne(s).
Envie / craving: "${req.craving || "surprise-moi avec quelque chose de bon"}"
Dans le frigo / dispo: ${req.pantry.length > 0 ? req.pantry.join(", ") : "peu de choses"}
Courses rapides autorisées: ${req.quickShopOk ? "oui, 2-3 ingrédients max à acheter" : "non, uniquement avec le frigo"}

Pour chaque ingrédient, mets status "available" si présent dans le frigo (même approximatif), "to_buy" si manquant et courses OK, "optional" si manquant et pas de courses.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.85,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: CHEF_SYSTEM },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI ${res.status}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Réponse vide");

    const parsed = JSON.parse(content) as { recipes?: RecipeProposal[] };
    const recipes = (parsed.recipes ?? []).slice(0, 3).map((r, i) => ({
      ...r,
      id: r.id || `ai-${i}`,
    }));

    if (recipes.length === 0) throw new Error("Aucune recette");

    return { recipes, source: "openai" };
  } catch {
    return {
      recipes: buildFallbackRecipes(req),
      source: "fallback",
      message: "IA indisponible — recettes locales proposées",
    };
  }
}
