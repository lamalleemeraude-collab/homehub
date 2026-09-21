/** Idée repas compacte (génération IA / favoris) */
export type MiniRecipe = {
  ingredients: string[];
  steps: string[];
};

export type MenuIdea = {
  id: string;
  title: string;
  shortDescription: string;
  /** Emoji plat (pizza, pâtes…) */
  emoji?: string;
  miniRecipe: MiniRecipe;
};

export type FavoriteMenu = MenuIdea & {
  favoritedAt: string;
};
