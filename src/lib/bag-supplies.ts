export type BagCategory =
  | "francais"
  | "mathematiques"
  | "langues"
  | "histoire-geo-musique"
  | "svt-sciences"
  | "arts-vie-classe"
  | "permanent-sac"
  | "autre";

export type BagSupplyItem = {
  id: string;
  label: string;
  shortLabel: string;
  category: BagCategory;
};

export const BAG_CATEGORY_ORDER: BagCategory[] = [
  "francais",
  "mathematiques",
  "langues",
  "histoire-geo-musique",
  "svt-sciences",
  "arts-vie-classe",
  "permanent-sac",
  "autre",
];

export const BAG_CATEGORY_META: Record<
  BagCategory,
  { label: string; emoji: string; tile: string; text: string; header: string }
> = {
  francais: {
    label: "Français",
    emoji: "📘",
    tile: "bg-white border-emerald-400",
    text: "text-slate-900",
    header: "text-emerald-800",
  },
  mathematiques: {
    label: "Mathématiques",
    emoji: "🔢",
    tile: "bg-white border-blue-400",
    text: "text-slate-900",
    header: "text-blue-800",
  },
  langues: {
    label: "Langues",
    emoji: "🌍",
    tile: "bg-white border-violet-400",
    text: "text-slate-900",
    header: "text-violet-800",
  },
  "histoire-geo-musique": {
    label: "Histoire-Géo & Musique",
    emoji: "🎵",
    tile: "bg-white border-amber-400",
    text: "text-slate-900",
    header: "text-amber-800",
  },
  "svt-sciences": {
    label: "SVT & Sciences",
    emoji: "🔬",
    tile: "bg-white border-teal-400",
    text: "text-slate-900",
    header: "text-teal-800",
  },
  "arts-vie-classe": {
    label: "Arts & Vie de classe",
    emoji: "🎨",
    tile: "bg-white border-rose-400",
    text: "text-slate-900",
    header: "text-rose-800",
  },
  "permanent-sac": {
    label: "Dans le sac en permanence",
    emoji: "🎒",
    tile: "bg-white border-orange-400",
    text: "text-slate-900",
    header: "text-orange-800",
  },
  autre: {
    label: "Autre",
    emoji: "📦",
    tile: "bg-white border-slate-400",
    text: "text-slate-900",
    header: "text-slate-700",
  },
};

export const officialBagItems: BagSupplyItem[] = [
  {
    id: "fr-1",
    label: "3 cahiers grands carreaux",
    shortLabel: "3 cahiers\ngrands carreaux",
    category: "francais",
  },
  {
    id: "fr-2",
    label: "Dictionnaire de poche",
    shortLabel: "Dictionnaire\nde poche",
    category: "francais",
  },
  {
    id: "math-1",
    label: "2 cahiers petits carreaux",
    shortLabel: "2 cahiers\npetits carreaux",
    category: "mathematiques",
  },
  {
    id: "math-2",
    label: "1 classeur souple + 6 intercalaires",
    shortLabel: "Classeur\n+ intercalaires",
    category: "mathematiques",
  },
  {
    id: "math-3",
    label: "Feuilles simples petits carreaux",
    shortLabel: "Feuilles\npetits carreaux",
    category: "mathematiques",
  },
  {
    id: "lv-1",
    label: "Anglais : 1 cahier grands carreaux",
    shortLabel: "Cahier\nAnglais",
    category: "langues",
  },
  {
    id: "lv-2",
    label: "Anglais : 1 porte-vues 60 vues",
    shortLabel: "Porte-vues\n60 vues",
    category: "langues",
  },
  {
    id: "lv-3",
    label: "Allemand : 2 cahiers grands carreaux",
    shortLabel: "2 cahiers\nAllemand",
    category: "langues",
  },
  {
    id: "lv-4",
    label: "LV2 : 2 cahiers grands carreaux",
    shortLabel: "2 cahiers\nLV2",
    category: "langues",
  },
  {
    id: "lv-5",
    label: "LV2 : 1 porte-vues 40 vues",
    shortLabel: "Porte-vues\n40 vues",
    category: "langues",
  },
  {
    id: "hg-1",
    label: "Histoire-Géo / EMC : 3 cahiers grands carreaux",
    shortLabel: "3 cahiers\nHistoire-Géo",
    category: "histoire-geo-musique",
  },
  {
    id: "hg-2",
    label: "Musique : 1 cahier grands carreaux",
    shortLabel: "Cahier\nMusique",
    category: "histoire-geo-musique",
  },
  {
    id: "svt-1",
    label: "SVT : 1 classeur souple + 6 intercalaires",
    shortLabel: "Classeur\nSVT",
    category: "svt-sciences",
  },
  {
    id: "svt-2",
    label: "Pochettes plastiques + copies simples",
    shortLabel: "Pochettes\n+ copies",
    category: "svt-sciences",
  },
  {
    id: "art-1",
    label: "Arts : porte-vues 20 vues",
    shortLabel: "Porte-vues\nArts 20 vues",
    category: "arts-vie-classe",
  },
  {
    id: "art-2",
    label: "5 tubes gouaches, chiffon, marqueur noir",
    shortLabel: "Gouaches\n+ marqueur",
    category: "arts-vie-classe",
  },
  {
    id: "art-3",
    label: "Vie de classe : porte-vues 40 vues",
    shortLabel: "Porte-vues\nVie de classe",
    category: "arts-vie-classe",
  },
  {
    id: "perm-1",
    label: "Trousse complète",
    shortLabel: "Trousse\ncomplète",
    category: "permanent-sac",
  },
  {
    id: "perm-2",
    label: "Matériel de géométrie (règle, équerre, rapporteur, compas)",
    shortLabel: "Matériel\ngéométrie",
    category: "permanent-sac",
  },
  {
    id: "perm-3",
    label: "Pochette à rabats",
    shortLabel: "Pochette\nà rabats",
    category: "permanent-sac",
  },
  {
    id: "perm-4",
    label: "Cahier de brouillon",
    shortLabel: "Cahier\nde brouillon",
    category: "permanent-sac",
  },
  {
    id: "perm-5",
    label: "Ardoise + feutre",
    shortLabel: "Ardoise\n+ feutre",
    category: "permanent-sac",
  },
  {
    id: "perm-6",
    label: "Réserve de copies / feuilles",
    shortLabel: "Réserve\ncopies/feuilles",
    category: "permanent-sac",
  },
  {
    id: "perm-7",
    label: "Calculatrice Casio FX-92 Collège",
    shortLabel: "Calculatrice\nFX-92",
    category: "permanent-sac",
  },
  {
    id: "perm-8",
    label: "Clés + cadenas casier",
    shortLabel: "Clés +\ncadenas",
    category: "permanent-sac",
  },
  {
    id: "perm-9",
    label: "Casque filaire jack",
    shortLabel: "Casque\njack",
    category: "permanent-sac",
  },
  {
    id: "perm-10",
    label: "Clé USB 8 Go",
    shortLabel: "Clé USB\n8 Go",
    category: "permanent-sac",
  },
];

const KEYWORDS: Record<Exclude<BagCategory, "autre">, string[]> = {
  francais: [
    "francais",
    "francais",
    "franse",
    "franse",
    "dictionnaire",
    "dictonnaire",
    "dicitionnaire",
    "cahier francais",
    "grands carreaux francais",
    "lecture",
    "conjugaison",
  ],
  mathematiques: [
    "maths",
    "mathematiques",
    "mathematique",
    "math",
    "mat",
    "geometrie",
    "geo",
    "compas",
    "equerre",
    "petits carreaux",
    "classeur maths",
    "intercalaire",
    "intercalair",
  ],
  langues: [
    "anglais",
    "english",
    "anglais",
    "allemand",
    "alemand",
    "bilangue",
    "espagnol",
    "lv2",
    "langue",
    "langues",
    "porte vues",
    "porte-vues",
    "portevues",
    "port vue",
  ],
  "histoire-geo-musique": [
    "histoire",
    "istor",
    "geo",
    "geographie",
    "emc",
    "musique",
    "musiq",
    "flute",
    "flute",
    "partition",
  ],
  "svt-sciences": [
    "svt",
    "science",
    "sciences",
    "physique",
    "physiq",
    "biologie",
    "pochette plastique",
    "pochettes",
    "labo",
  ],
  "arts-vie-classe": [
    "arts",
    "art plastique",
    "plastique",
    "gouache",
    "gouaches",
    "peinture",
    "marqueur",
    "chiffon",
    "vie de classe",
    "delegue",
  ],
  "permanent-sac": [
    "trousse",
    "trouse",
    "stylo",
    "crayon",
    "brouillon",
    "broillon",
    "ardoise",
    "feutre",
    "copie",
    "copies",
    "feuille",
    "feuilles",
    "rabat",
    "pochette rabat",
    "permanent",
    "quotidien",
    "calculatrice",
    "fx92",
    "fx-92",
    "casio",
    "cadenas",
    "casier",
    "cles",
    "casque",
    "ecouteurs",
    "jack",
    "usb",
    "cle usb",
    "rapporteur",
    "compas",
    "equerre",
    "regle",
    "geometrie",
  ],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[a.length][b.length];
}

function fuzzyMatchScore(input: string, keyword: string): number {
  if (input.includes(keyword) || keyword.includes(input)) return 100;

  const inputWords = input.split(" ").filter((w) => w.length >= 2);

  for (const word of inputWords) {
    const maxDist = word.length <= 4 ? 1 : 2;
    if (levenshtein(word, keyword) <= maxDist) return 85;
  }

  const maxDistFull = Math.max(2, Math.floor(keyword.length / 4));
  if (levenshtein(input, keyword) <= maxDistFull) return 70;

  return 0;
}

export function categorizeBagItem(label: string): BagCategory {
  const normalized = normalize(label);
  if (!normalized) return "autre";

  for (const item of officialBagItems) {
    const itemNorm = normalize(item.label);
    if (
      normalized.includes(itemNorm) ||
      itemNorm.includes(normalized) ||
      fuzzyMatchScore(normalized, itemNorm) >= 85
    ) {
      return item.category;
    }
  }

  let bestCategory: BagCategory = "autre";
  let bestScore = 0;

  for (const category of BAG_CATEGORY_ORDER) {
    if (category === "autre") continue;
    const keywords = KEYWORDS[category];

    for (const keyword of keywords) {
      const kw = normalize(keyword);
      const score = fuzzyMatchScore(normalized, kw);
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }
  }

  return bestScore >= 70 ? bestCategory : "autre";
}

export function createBagItem(label: string): BagSupplyItem {
  const trimmed = label.trim();
  return {
    id: crypto.randomUUID(),
    label: trimmed,
    shortLabel: trimmed,
    category: categorizeBagItem(trimmed),
  };
}

export function groupBagItems(items: BagSupplyItem[]) {
  const groups = new Map<BagCategory, BagSupplyItem[]>();
  for (const cat of BAG_CATEGORY_ORDER) groups.set(cat, []);

  for (const item of items) {
    groups.get(item.category)?.push(item);
  }

  return BAG_CATEGORY_ORDER.filter(
    (cat) => (groups.get(cat)?.length ?? 0) > 0
  ).map((category) => ({
    category,
    items: groups.get(category) ?? [],
  }));
}

function withIdSuffix(item: BagSupplyItem, idSuffix: string): BagSupplyItem {
  if (!idSuffix) return item;
  return { ...item, id: `${item.id}${idSuffix}` };
}

/** Sépare les lignes « A + B » sans éclater les quantités (2 cahiers, 6 intercalaires…). */
export function expandBagItem(item: BagSupplyItem): BagSupplyItem[] {
  if (item.label.includes("+")) {
    const parts = item.label.split("+").map((p) => p.trim());
    if (parts.length >= 2) {
      return parts.map((part, i) =>
        withIdSuffix(
          {
            ...item,
            label: part,
            shortLabel: part.replace(/\s+/g, "\n"),
          },
          `-p${i}`
        )
      );
    }
  }
  return [item];
}

export function expandBagItems(items: BagSupplyItem[]): BagSupplyItem[] {
  return items.flatMap(expandBagItem);
}
