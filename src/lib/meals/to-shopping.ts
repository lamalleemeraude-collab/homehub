import { createShoppingItem, type ShoppingItem } from "@/lib/shopping-categories";
import { resolveProductInput } from "@/lib/shopping-product-icon";
import { allWeekIngredients, loadMealPlan } from "@/lib/meals/storage";

export function mealIngredientsToShoppingItems(
  existing: ShoppingItem[]
): ShoppingItem[] {
  const plan = loadMealPlan();
  const ingredients = allWeekIngredients(plan);
  const existingLabels = new Set(
    existing.map((i) => i.label.toLowerCase())
  );

  const added: ShoppingItem[] = [];

  for (const raw of ingredients) {
    const resolved = resolveProductInput(raw);
    if (!resolved.label) continue;
    if (existingLabels.has(resolved.label.toLowerCase())) continue;

    const item = createShoppingItem(resolved.label);
    added.push({ ...item, label: resolved.label });
    existingLabels.add(resolved.label.toLowerCase());
  }

  return added;
}
