import type { DayMeals, MealPlanStorage, WeekMeals } from "@/lib/meals/types";

const STORAGE_KEY = "homehub-meal-plan";

function mondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function currentWeekStart(): string {
  return toDateKey(mondayOfWeek(new Date()));
}

function defaultWeek(): WeekMeals {
  return {
    0: { midi: "Cantine", soir: "Pâtes bolognaise", ingredients: ["Pâtes", "Sauce tomate", "Viande hachée"] },
    1: { midi: "Cantine", soir: "Poisson & légumes", ingredients: ["Saumon", "Courgette", "Riz"] },
    2: { midi: "Cantine", soir: "Lasagnes", ingredients: ["Lasagnes", "Fromage", "Salade"] },
    3: { midi: "Cantine", soir: "Omelette", ingredients: ["Œufs", "Salade", "Pain"] },
    4: { midi: "Cantine", soir: "Pizza maison", ingredients: ["Pâtes pizza", "Mozzarella", "Tomates"] },
    5: { soir: "Restaurant / libre", ingredients: [] },
    6: { soir: "Gratin dauphinois", ingredients: ["Pommes de terre", "Crème", "Lait"] },
  };
}

export function loadMealPlan(): MealPlanStorage {
  if (typeof window === "undefined") {
    return {
      weekStart: currentWeekStart(),
      days: defaultWeek(),
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = {
        weekStart: currentWeekStart(),
        days: defaultWeek(),
        updatedAt: new Date().toISOString(),
      };
      saveMealPlan(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as MealPlanStorage;
    if (parsed.weekStart !== currentWeekStart()) {
      const fresh = {
        weekStart: currentWeekStart(),
        days: defaultWeek(),
        updatedAt: new Date().toISOString(),
      };
      saveMealPlan(fresh);
      return fresh;
    }
    return parsed;
  } catch {
    return {
      weekStart: currentWeekStart(),
      days: defaultWeek(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export function saveMealPlan(plan: MealPlanStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export function updateDayMeals(dayIndex: number, patch: Partial<DayMeals>): MealPlanStorage {
  const plan = loadMealPlan();
  const prev = plan.days[dayIndex] ?? { ingredients: [] };
  plan.days[dayIndex] = {
    ...prev,
    ...patch,
    ingredients: patch.ingredients ?? prev.ingredients ?? [],
  };
  plan.updatedAt = new Date().toISOString();
  saveMealPlan(plan);
  return plan;
}

export function allWeekIngredients(plan: MealPlanStorage): string[] {
  const set = new Set<string>();
  for (let i = 0; i < 7; i++) {
    const day = plan.days[i];
    if (!day) continue;
    for (const ing of day.ingredients ?? []) {
      if (ing.trim()) set.add(ing.trim());
    }
  }
  return [...set];
}

export function todayDayIndex(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

export function tomorrowDayIndex(): number {
  return (todayDayIndex() + 1) % 7;
}
