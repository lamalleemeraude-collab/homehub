export type IngredientStatus = "available" | "to_buy" | "optional";

export type RecipeIngredient = {
  name: string;
  quantity: string;
  status: IngredientStatus;
};

export type RecipeProposal = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  prepMinutes: number;
  difficulty: "facile" | "moyen";
  ingredients: RecipeIngredient[];
  steps: string[];
  chefTip: string;
};

export type ChefGenerateRequest = {
  craving: string;
  pantry: string[];
  quickShopOk: boolean;
  mealType: "midi" | "soir";
  servings: number;
};

export type ChefGenerateResponse = {
  recipes: RecipeProposal[];
  source: "openai" | "fallback";
  message?: string;
};

export type SavedChefMeal = {
  recipe: RecipeProposal;
  savedAt: string;
  mealType: "midi" | "soir";
};
