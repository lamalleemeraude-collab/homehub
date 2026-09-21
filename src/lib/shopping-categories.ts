import { resolveProductInput } from "./shopping-product-icon";

export type ShoppingCategory =
  | "fruits-legumes"
  | "frais-laitier"
  | "epicerie"
  | "boulangerie"
  | "entretien-hygiene"
  | "autre";

export type ShoppingItem = {
  id: string;
  label: string;
  checked: boolean;
  category: ShoppingCategory;
  emoji: string;
};

export const CATEGORY_ORDER: ShoppingCategory[] = [
  "fruits-legumes",
  "frais-laitier",
  "epicerie",
  "boulangerie",
  "entretien-hygiene",
  "autre",
];

export const CATEGORY_META: Record<
  ShoppingCategory,
  { label: string; familyLabel: string; emoji: string }
> = {
  "fruits-legumes": { label: "Fruits & Légumes", familyLabel: "Légumes", emoji: "🍎" },
  "frais-laitier": { label: "Frais & Laitier", familyLabel: "Frais", emoji: "🥛" },
  epicerie: { label: "Épicerie", familyLabel: "Épicerie", emoji: "🛒" },
  boulangerie: { label: "Boulangerie", familyLabel: "Boulangerie", emoji: "🥖" },
  "entretien-hygiene": { label: "Entretien & Hygiène", familyLabel: "Entretien", emoji: "🧴" },
  autre: { label: "Autre", familyLabel: "Autre", emoji: "📦" },
};

const KEYWORDS: Record<Exclude<ShoppingCategory, "autre">, string[]> = {
  "fruits-legumes": [
    "nectarine",
    "pomme",
    "pommes",
    "banane",
    "tomate",
    "salade",
    "courgette",
  ],
  "frais-laitier": ["lait", "beurre", "fromage", "yaourt", "crème", "creme"],
  epicerie: [
    "pâtes",
    "pates",
    "riz",
    "café en grains",
    "cafe en grains",
    "café",
    "cafe",
    "chocolat",
    "farine",
    "sucre",
  ],
  boulangerie: ["pain", "baguette", "brioche"],
  "entretien-hygiene": [
    "savon",
    "dentifrice",
    "lessive",
    "papier toilette",
  ],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function categorizeItem(label: string): ShoppingCategory {
  const normalized = normalize(label);

  for (const category of CATEGORY_ORDER) {
    if (category === "autre") continue;
    const keywords = KEYWORDS[category];
    if (keywords.some((kw) => normalized.includes(normalize(kw)))) {
      return category;
    }
  }

  return "autre";
}

export function createShoppingItem(
  label: string,
  checked = false
): ShoppingItem {
  const resolved = resolveProductInput(label);
  const finalLabel = resolved.label || label.trim();
  return {
    id: crypto.randomUUID(),
    label: finalLabel,
    checked,
    category: categorizeItem(finalLabel),
    emoji: resolved.emoji,
  };
}

export const QUICK_ADD_ITEMS = [
  "Lait",
  "Pain",
  "Nectarine",
  "Café",
  "Fromage",
  "Yaourt",
] as const;

export const initialShoppingItems: ShoppingItem[] = [
  createShoppingItem("Lait"),
  createShoppingItem("Pain"),
  createShoppingItem("Pommes", true),
  createShoppingItem("Fromage râpé"),
];
