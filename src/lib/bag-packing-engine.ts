/**
 * Liste fournitures officielle — Collège Sainte-Marie La Richardais · 6e · 2026-2027
 * Source : public/docs/liste-fournitures-maelle.pdf
 *
 * Logique « bon sens » :
 * - Équipement quotidien → toujours dans le sac
 * - Par matière → seulement ce qui sert DEMAIN (1 cahier parmi le stock annuel, pas tout le paquet)
 * - SVT + Physique-Chimie → 1 seul classeur partagé
 * - Bilangue + Allemand le même jour → pas de doublon de cahier
 */
import type { BagTag } from "@/lib/schedule/scheduleData";
import type { BagCategory, BagSupplyItem } from "@/lib/bag-supplies";

export const SUPPLIES_PDF_PATH = "/docs/liste-fournitures-maelle.pdf";

export type PackItem = BagSupplyItem & {
  /** Pourquoi cet objet est suggéré ce soir */
  reason: string;
  essential: boolean;
};

/** Fournitures toujours dans le cartable (équipement quotidien). */
export const PERMANENT_PACK: PackItem[] = [
  {
    id: "perm-trousse",
    label: "Trousse complète",
    shortLabel: "Trousse\ncomplète",
    category: "permanent-sac",
    reason: "Stylos (bleu, vert, rouge, noir), blanco, crayons HB/2B, surligneurs, crayons de couleur, ciseaux, colle, scotch, gomme, taille-crayon, stylo 0,5 mm",
    essential: true,
  },
  {
    id: "perm-geo",
    label: "Matériel de géométrie",
    shortLabel: "Matériel\ngéométrie",
    category: "permanent-sac",
    reason: "Règle 30 cm, équerre, rapporteur, compas à bague",
    essential: true,
  },
  {
    id: "perm-calc",
    label: "Calculatrice Casio FX-92 Collège",
    shortLabel: "Calculatrice\nFX-92",
    category: "permanent-sac",
    reason: "Tous les jours — à garder dans le sac",
    essential: true,
  },
  {
    id: "perm-pochette",
    label: "Pochette à rabats",
    shortLabel: "Pochette\nà rabats",
    category: "permanent-sac",
    reason: "Tous les jours",
    essential: true,
  },
  {
    id: "perm-brouillon",
    label: "Cahier de brouillon",
    shortLabel: "Cahier\nde brouillon",
    category: "permanent-sac",
    reason: "Tous les jours",
    essential: true,
  },
  {
    id: "perm-ardoise",
    label: "Ardoise + feutre",
    shortLabel: "Ardoise\n+ feutre",
    category: "permanent-sac",
    reason: "Tous les jours",
    essential: false,
  },
  {
    id: "perm-reserve",
    label: "Réserve de copies / feuilles",
    shortLabel: "Réserve\ncopies",
    category: "permanent-sac",
    reason: "Feuilles simples, doubles, pochettes plastiques (réparties entre les matières)",
    essential: true,
  },
  {
    id: "perm-cles",
    label: "Clés + cadenas casier",
    shortLabel: "Clés +\ncadenas",
    category: "permanent-sac",
    reason: "Cadenas moyen format à clé",
    essential: true,
  },
  {
    id: "perm-casque",
    label: "Casque filaire (jack)",
    shortLabel: "Casque\njack",
    category: "permanent-sac",
    reason: "Informatique / cours numériques",
    essential: false,
  },
  {
    id: "perm-usb",
    label: "Clé USB 8 Go",
    shortLabel: "Clé USB\n8 Go",
    category: "permanent-sac",
    reason: "Informatique",
    essential: false,
  },
];

/** Classeur partagé SVT + Physique-Chimie (liste officielle). */
export const SHARED_SCIENCES_PACK: PackItem[] = [
  {
    id: "daily-sciences-classeur",
    label: "1 classeur souple A4 + 6 intercalaires (SVT & Physique-Chimie)",
    shortLabel: "Classeur\nSciences",
    category: "svt-sciences",
    reason: "Sciences demain — un seul classeur pour SVT et Physique-Chimie",
    essential: true,
  },
  {
    id: "daily-sciences-pochettes",
    label: "Pochettes plastiques + feuilles simples",
    shortLabel: "Pochettes\n+ feuilles",
    category: "svt-sciences",
    reason: "Sciences demain",
    essential: true,
  },
];

/**
 * Par matière : ce qu'il faut PRENDRE pour UN cours (pas tout le stock annuel).
 */
export const SUBJECT_DAILY_PACKS: Record<BagTag, PackItem[]> = {
  francais: [
    {
      id: "daily-fr-cahier",
      label: "1 cahier grands carreaux 24×32 (Français)",
      shortLabel: "1 cahier\nFrançais",
      category: "francais",
      reason: "Français demain — 1 seul cahier suffit (la liste en prévoit 3 pour l'année)",
      essential: true,
    },
    {
      id: "daily-fr-dico",
      label: "Dictionnaire de poche (non Junior)",
      shortLabel: "Diction-\nnaire",
      category: "francais",
      reason: "Français demain",
      essential: true,
    },
  ],
  mathematiques: [
    {
      id: "daily-math-cahier",
      label: "1 cahier petits carreaux 24×32 (Maths)",
      shortLabel: "1 cahier\nMaths",
      category: "mathematiques",
      reason: "Maths demain — 1 seul cahier suffit (la liste en prévoit 2 pour l'année)",
      essential: true,
    },
    {
      id: "daily-math-classeur",
      label: "1 classeur souple A4 + 6 intercalaires (Maths)",
      shortLabel: "Classeur\nMaths",
      category: "mathematiques",
      reason: "Maths demain — classeur dédié aux maths",
      essential: true,
    },
    {
      id: "daily-math-feuilles",
      label: "Feuilles simples petits carreaux",
      shortLabel: "Feuilles\npetits carr.",
      category: "mathematiques",
      reason: "Maths demain",
      essential: false,
    },
    {
      id: "perm-calc",
      label: "Calculatrice Casio FX-92 Collège",
      shortLabel: "Calculatrice\nFX-92",
      category: "mathematiques",
      reason: "Maths demain — calculatrice dans le sac",
      essential: true,
    },
  ],
  anglais: [
    {
      id: "daily-en-cahier",
      label: "1 cahier grands carreaux 24×32 (Anglais)",
      shortLabel: "Cahier\nAnglais",
      category: "langues",
      reason: "Anglais demain",
      essential: true,
    },
    {
      id: "daily-en-porte",
      label: "Porte-vues 60 vues (Anglais)",
      shortLabel: "Porte-vues\n60 vues",
      category: "langues",
      reason: "Anglais demain — à conserver de la 6e à la 3e",
      essential: true,
    },
  ],
  allemand: [
    {
      id: "daily-de-cahier",
      label: "1 cahier grands carreaux 24×32 (Allemand)",
      shortLabel: "1 cahier\nAllemand",
      category: "langues",
      reason: "Allemand demain — 1 seul cahier suffit (la liste en prévoit 2 pour l'année)",
      essential: true,
    },
  ],
  bilangue: [
    {
      id: "daily-bil-cahier",
      label: "1 cahier grands carreaux 24×32 (Bilangue / LV2)",
      shortLabel: "1 cahier\nBilangue",
      category: "langues",
      reason: "Bilangue demain — 1 seul cahier suffit",
      essential: true,
    },
    {
      id: "daily-lv2-porte",
      label: "Porte-vues 40 vues (LV2 Allemand & Espagnol)",
      shortLabel: "Porte-vues\n40 vues",
      category: "langues",
      reason: "Bilangue / LV2 demain — partagé entre les deux langues",
      essential: true,
    },
  ],
  "histoire-geo": [
    {
      id: "daily-hg-cahier",
      label: "1 cahier grands carreaux 24×32 (Histoire-Géo / EMC)",
      shortLabel: "1 cahier\nHistoire-Géo",
      category: "histoire-geo-musique",
      reason: "Histoire-Géo demain — 1 seul cahier suffit (la liste en prévoit 3 pour l'année)",
      essential: true,
    },
  ],
  musique: [
    {
      id: "daily-mus-cahier",
      label: "1 cahier grands carreaux 24×32 (Musique)",
      shortLabel: "Cahier\nMusique",
      category: "histoire-geo-musique",
      reason: "Musique demain — à conserver de la 6e à la 3e",
      essential: true,
    },
  ],
  svt: [],
  "physique-chimie": [],
  eps: [
    {
      id: "daily-eps-sac",
      label: "Sac de sport",
      shortLabel: "Sac\nde sport",
      category: "autre",
      reason: "EPS demain",
      essential: true,
    },
    {
      id: "daily-eps-tenue",
      label: "Tenue EPS (T-shirt + K-way)",
      shortLabel: "Tenue\nEPS",
      category: "autre",
      reason: "EPS demain — tenue de rechange",
      essential: true,
    },
    {
      id: "daily-eps-baskets",
      label: "Chaussures de sport",
      shortLabel: "Baskets",
      category: "autre",
      reason: "EPS demain — baskets obligatoires",
      essential: true,
    },
  ],
  "arts-plastiques": [
    {
      id: "daily-art-porte",
      label: "Porte-vues 20 vues (Arts plastiques)",
      shortLabel: "Porte-vues\nArts",
      category: "arts-vie-classe",
      reason: "Arts plastiques demain — à conserver de la 6e à la 3e",
      essential: true,
    },
    {
      id: "daily-art-gouache",
      label: "5 tubes gouaches (primaires + noir/blanc), chiffon, marqueur noir indélébile fin",
      shortLabel: "Gouaches\n+ marqueur",
      category: "arts-vie-classe",
      reason: "Arts plastiques demain",
      essential: true,
    },
  ],
  "vie-classe": [
    {
      id: "daily-vc-porte",
      label: "Porte-vues 40 vues (Vie de classe)",
      shortLabel: "Porte-vues\nVie classe",
      category: "arts-vie-classe",
      reason: "Vie de classe demain — à conserver de la 6e à la 3e",
      essential: true,
    },
  ],
};

/** Inventaire annuel à la maison (référence PDF — pas à tout mettre chaque jour). */
export const HOME_INVENTORY_BY_SUBJECT: Record<string, string[]> = {
  "Français": [
    "3 cahiers grands carreaux 24×32 (48 p.)",
    "Dictionnaire de poche (non Junior)",
  ],
  "Mathématiques": [
    "2 cahiers petits carreaux 24×32 (48 p.)",
    "1 classeur souple A4 (4 cm) + 6 intercalaires cartonnés",
    "Feuilles simples petits carreaux",
  ],
  "Anglais": [
    "1 cahier grands carreaux 24×32",
    "1 porte-vues 60 vues (de la 6e à la 3e)",
  ],
  "Allemand — Bilangue": ["2 cahiers grands carreaux 24×32"],
  "Découverte LV2 (Allemand & Espagnol)": [
    "2 cahiers grands carreaux 24×32",
    "1 porte-vues 40 vues (partagé)",
  ],
  "Histoire-Géo / EMC": ["3 cahiers grands carreaux 24×32"],
  "Musique": ["1 cahier grands carreaux 24×32 (de la 6e à la 3e)"],
  "SVT & Physique-Chimie": [
    "1 classeur souple A4 + 6 intercalaires (partagé)",
    "Pochettes plastiques + feuilles simples",
  ],
  "Arts plastiques": [
    "1 porte-vues 20 vues (de la 6e à la 3e)",
    "5 tubes gouaches + chiffon + marqueur noir fin",
  ],
  "Vie de classe": ["1 porte-vues 40 vues (de la 6e à la 3e)"],
  EPS: [
    "Sac de sport",
    "Tenue de rechange + baskets + T-shirt + K-way",
  ],
};

const SCIENCE_TAGS = new Set<BagTag>(["svt", "physique-chimie"]);

function shouldSkipTag(tag: BagTag, tagSet: Set<BagTag>): boolean {
  if (SCIENCE_TAGS.has(tag)) return true;
  if (tag === "allemand" && tagSet.has("bilangue")) return true;
  return false;
}

export function packItemsForTags(tags: BagTag[]): PackItem[] {
  const byId = new Map<string, PackItem>();
  const tagSet = new Set(tags);

  const add = (item: PackItem) => {
    if (!byId.has(item.id)) byId.set(item.id, item);
  };

  for (const item of PERMANENT_PACK) add(item);

  if (tags.some((t) => SCIENCE_TAGS.has(t))) {
    for (const item of SHARED_SCIENCES_PACK) add(item);
  }

  for (const tag of tags) {
    if (shouldSkipTag(tag, tagSet)) continue;
    for (const item of SUBJECT_DAILY_PACKS[tag] ?? []) add(item);
  }

  return [...byId.values()];
}

/** Résumé textuel pour affichage / aide (bon sens appliqué). */
export function describePackForTags(tags: BagTag[]): string {
  if (tags.length === 0) {
    return "Pas de cours demain — seulement l'équipement quotidien si besoin.";
  }

  const subjects = tags.filter((t) => !SCIENCE_TAGS.has(t) || t === "svt");
  const hasSciences = tags.some((t) => SCIENCE_TAGS.has(t));
  const parts: string[] = [
    "Équipement quotidien dans le sac",
    ...subjects.map((t) => SUBJECT_DAILY_PACKS[t]?.[0]?.reason?.split("—")[0]?.trim() ?? t),
  ];

  if (hasSciences) parts.push("classeur sciences partagé");

  return `${parts.filter(Boolean).join(" · ")}.`;
}
