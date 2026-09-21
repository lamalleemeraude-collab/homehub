export type MealSlot = "midi" | "soir";

export type DayMeals = {
  midi?: string;
  soir?: string;
  /** Ingrédients explicites pour la liste de courses */
  ingredients: string[];
};

/** Index 0 = lundi … 6 = dimanche */
export type WeekMeals = Record<number, DayMeals>;

export type MealPlanStorage = {
  weekStart: string;
  days: WeekMeals;
  updatedAt: string;
};

export const MEAL_DAY_LABELS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;
