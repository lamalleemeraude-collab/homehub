import { createShoppingItem, type ShoppingItem } from "@/lib/shopping-categories";
import { resolveProductInput } from "@/lib/shopping-product-icon";
import type { RecipeProposal } from "@/lib/meals/chef-types";

export function recipeMissingToShoppingItems(
  recipe: RecipeProposal,
  existing: ShoppingItem[]
): ShoppingItem[] {
  const existingLabels = new Set(
    existing.map((i) => i.label.toLowerCase())
  );
  const added: ShoppingItem[] = [];

  for (const ing of recipe.ingredients) {
    if (ing.status !== "to_buy") continue;
    const resolved = resolveProductInput(ing.name);
    const label = resolved.label || ing.name;
    if (existingLabels.has(label.toLowerCase())) continue;

    const item = createShoppingItem(label);
    added.push({ ...item, label });
    existingLabels.add(label.toLowerCase());
  }

  return added;
}

export function missingIngredientLabels(recipe: RecipeProposal): string[] {
  return recipe.ingredients
    .filter((i) => i.status === "to_buy")
    .map((i) => i.name);
}
