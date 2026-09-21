export type ResolvedProduct = {
  label: string;
  emoji: string;
  corrected: boolean;
  original: string;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Dictionnaire produit → emoji (français courant). */
const PRODUCT_EMOJI: Record<string, string> = {
  lait: "🥛",
  "lait demi ecreme": "🥛",
  beurre: "🧈",
  fromage: "🧀",
  yaourt: "🥛",
  creme: "🥛",
  oeuf: "🥚",
  oeufs: "🥚",
  pain: "🥖",
  baguette: "🥖",
  brioche: "🥐",
  croissant: "🥐",
  pomme: "🍎",
  pommes: "🍎",
  poire: "🍐",
  banane: "🍌",
  bananes: "🍌",
  orange: "🍊",
  oranges: "🍊",
  citron: "🍋",
  fraise: "🍓",
  fraises: "🍃",
  nectarine: "🍑",
  peche: "🍑",
  raisin: "🍇",
  tomate: "🍅",
  tomates: "🍅",
  salade: "🥬",
  laitue: "🥬",
  carotte: "🥕",
  carottes: "🥕",
  courgette: "🥒",
  courgettes: "🥒",
  aubergine: "🍆",
  poivron: "🫑",
  oignon: "🧅",
  oignons: "🧅",
  ail: "🧄",
  "pomme de terre": "🥔",
  patate: "🥔",
  riz: "🍚",
  pates: "🍝",
  pate: "🍝",
  semoule: "🌾",
  farine: "🌾",
  sucre: "🧂",
  sel: "🧂",
  huile: "🫒",
  olive: "🫒",
  cafe: "☕",
  the: "🍵",
  chocolat: "🍫",
  biscuit: "🍪",
  biscuits: "🍪",
  gateau: "🍰",
  pizza: "🍕",
  jambon: "🥓",
  bacon: "🥓",
  poulet: "🍗",
  viande: "🥩",
  steak: "🥩",
  boeuf: "🥩",
  porc: "🥩",
  saumon: "🐟",
  poisson: "🐟",
  thon: "🐟",
  crevette: "🦐",
  crevettes: "🦐",
  lasagne: "🍝",
  lasagnes: "🍝",
  soupe: "🍲",
  potage: "🍲",
  legume: "🥦",
  legumes: "🥦",
  brocoli: "🥦",
  champignon: "🍄",
  champignons: "🍄",
  avocat: "🥑",
  mais: "🌽",
  concombre: "🥒",
  citrouille: "🎃",
  melon: "🍈",
  pasteque: "🍉",
  ananas: "🍍",
  kiwi: "🥝",
  mangue: "🥭",
  noix: "🥜",
  amande: "🥜",
  miel: "🍯",
  confiture: "🍯",
  moutarde: "🫙",
  ketchup: "🫙",
  sauce: "🫙",
  vinaigre: "🫙",
  epice: "🌶️",
  epices: "🌶️",
  poivre: "🧂",
  paprika: "🌶️",
  curry: "🌶️",
  basilic: "🌿",
  persil: "🌿",
  coriandre: "🌿",
  menthe: "🌿",
  savon: "🧼",
  dentifrice: "🪥",
  shampooing: "🧴",
  shampoing: "🧴",
  "gel douche": "🧴",
  lessive: "🧺",
  "papier toilette": "🧻",
  mouchoir: "🧻",
  mouchoirs: "🧻",
  eponge: "🧽",
  eau: "💧",
  "eau gazeuse": "💧",
  jus: "🧃",
  "jus d orange": "🧃",
  soda: "🥤",
  biere: "🍺",
  vin: "🍷",
  glace: "🍦",
  sorbet: "🍧",
  cereale: "🥣",
  cereales: "🥣",
  muesli: "🥣",
  tortilla: "🌮",
  tacos: "🌮",
  burger: "🍔",
  frites: "🍟",
  sandwich: "🥪",
  wrap: "🌯",
  sushi: "🍣",
  nouille: "🍜",
  nouilles: "🍜",
  ravioli: "🥟",
  gnocchi: "🥟",
  parmesan: "🧀",
  mozzarella: "🧀",
  feta: "🧀",
  comte: "🧀",
  emmental: "🧀",
  camembert: "🧀",
  brie: "🧀",
  roquefort: "🧀",
  "creme fraiche": "🥛",
  lardons: "🥓",
  saucisse: "🌭",
  saucisses: "🌭",
  merguez: "🌭",
  lentille: "🫘",
  lentilles: "🫘",
  haricot: "🫘",
  haricots: "🫘",
  "pois chiche": "🫘",
  tofu: "🧈",
  hummus: "🧆",
  falafel: "🧆",
};

const DICTIONARY_KEYS = Object.keys(PRODUCT_EMOJI);

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function titleCaseFr(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function findBestMatch(normalized: string): string | null {
  if (PRODUCT_EMOJI[normalized]) return normalized;

  let best: { key: string; dist: number } | null = null;
  for (const key of DICTIONARY_KEYS) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const dist = levenshtein(normalized, key);
      if (dist <= 2 && (!best || dist < best.dist)) {
        best = { key, dist };
      }
    }
  }

  if (best) return best.key;

  for (const key of DICTIONARY_KEYS) {
    const dist = levenshtein(normalized, key);
    if (dist <= 2 && (!best || dist < best.dist)) {
      best = { key, dist };
    }
  }

  return best?.key ?? null;
}

function emojiForNormalized(normalized: string): string {
  if (PRODUCT_EMOJI[normalized]) return PRODUCT_EMOJI[normalized];

  for (const key of DICTIONARY_KEYS) {
    if (normalized.includes(key)) return PRODUCT_EMOJI[key];
  }

  return "🛒";
}

export function resolveProductInput(raw: string): ResolvedProduct {
  const original = raw.trim();
  const normalized = normalize(original);

  if (!normalized) {
    return {
      label: "",
      emoji: "🛒",
      corrected: false,
      original,
    };
  }

  const match = findBestMatch(normalized);
  const label = match ? titleCaseFr(match) : titleCaseFr(original);
  const emoji = match ? PRODUCT_EMOJI[match] : emojiForNormalized(normalized);
  const corrected = match !== null && normalize(label) !== normalized;

  return {
    label: corrected ? label : titleCaseFr(original),
    emoji,
    corrected,
    original,
  };
}

export function productEmojiForLabel(label: string): string {
  return resolveProductInput(label).emoji;
}
