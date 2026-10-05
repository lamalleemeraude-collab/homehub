import type { HomeworkItem } from "@/lib/ecoledirecte/types";
import type { FlashCard, FlashDeck } from "./types";

const INSTRUCTION_PREFIX =
  /^(à\s+faire\s*:\s*|devoir\s*:\s*)?(réviser|revoir|apprendre|lire|faire|compléter|completer|travailler|s'?entraîner|sentrainer|étudier|etudier|préparer|preparer|relire|mémoriser|memoriser|noter|écrire|ecrire)\b/i;

const QUESTION_STARTERS =
  /^(qu['’]?est-ce|que\b|qui\b|quoi\b|quand\b|où\b|ou\b|comment\b|combien\b|pourquoi\b|cite|donne|explique|définis|definis|complète|complete|calibre|trouve|calcule|nomme|indique|rappel)/i;

function cleanText(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitChunks(text: string): string[] {
  return cleanText(text)
    .split(/\n+|(?<=[.!?…;])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8);
}

function stripInstructionLead(line: string): string {
  return line
    .replace(INSTRUCTION_PREFIX, "")
    .replace(/^(le|la|les|l'|un|une|des)\s+(chapitre|leçon|lecon|cours|fiche|page|pages|exercices?)\b[^:：\-–—]*/i, "")
    .replace(/^[\s:：\-–—]+/, "")
    .trim();
}

function looksLikeQuestion(front: string): boolean {
  const t = front.trim();
  if (!t) return false;
  if (/[?？]$/.test(t)) return true;
  if (/^complète\b/i.test(t)) return true;
  if (QUESTION_STARTERS.test(t)) return true;
  return false;
}

/** Garantit un recto interrogatif (pas une consigne ni un titre de devoir). */
export function ensureQuestionFront(front: string, matiere?: string): string {
  const raw = front.trim().replace(/\s+/g, " ");
  if (!raw) {
    return matiere
      ? `Que dois-tu retenir en ${matiere} ?`
      : "Que dois-tu retenir ?";
  }
  // « Complète… » est déjà une consigne claire — pas de « ? » en plus.
  if (/^complète\b/i.test(raw)) {
    return raw.replace(/\s*[?？]+$/, "");
  }
  if (looksLikeQuestion(raw)) {
    return /[?？]$/.test(raw) ? raw : `${raw} ?`;
  }
  // Évite les faux "Matière — Maths (2026-10-07) ?" issus des métadonnées.
  if (/^[^(]{1,40}\s*\(\d{4}-\d{2}-\d{2}\)\s*\??$/i.test(raw)) {
    return matiere
      ? `Que faut-il savoir pour ${matiere} ?`
      : "Que faut-il savoir pour ce devoir ?";
  }
  if (INSTRUCTION_PREFIX.test(raw)) {
    const rest = stripInstructionLead(raw);
    if (rest.length >= 8) {
      return `Que dois-tu savoir sur : ${rest.replace(/[?？.]+$/, "")} ?`;
    }
  }
  return `Question : ${raw.replace(/[?？.]+$/, "")} ?`;
}

function pushCard(
  cards: FlashCard[],
  front: string,
  back: string,
  tip: string,
  matiere: string
) {
  const q = ensureQuestionFront(front, matiere);
  const a = back.trim();
  if (!q || !a || a.length < 2) return;
  if (cards.some((c) => c.front === q && c.back === a)) return;
  cards.push({
    id: `fb-${cards.length}`,
    front: q,
    back: a,
    tip,
  });
}

function parseDefinition(line: string): { term: string; def: string } | null {
  const colon = line.match(/^(.{2,70}?)\s*[:：]\s*(.+)$/);
  if (colon) {
    const term = colon[1].trim();
    const def = colon[2].trim();
    if (
      term.length >= 2 &&
      def.length >= 4 &&
      !/^\d{4}-\d{2}-\d{2}$/.test(term) &&
      !/\(\d{4}-\d{2}-\d{2}\)/.test(term)
    ) {
      return { term, def };
    }
  }
  const eq = line.match(/^(.{2,70}?)\s*=\s*(.+)$/);
  if (eq) {
    return { term: eq[1].trim(), def: eq[2].trim() };
  }
  return null;
}

function parseEstSentence(line: string): { term: string; def: string } | null {
  const m = line.match(
    /^(.{2,80}?)\s+(est|sont|c['’]est|désigne|designe|signifie|correspond à|correspond a)\s+(.+)$/i
  );
  if (!m) return null;
  // Garde l'article (« le périmètre ») pour une question naturelle.
  const term = m[1].trim().replace(/^./, (ch) => ch.toLowerCase());
  const def = m[3].trim().replace(/[.!?…]+$/, "");
  if (term.length < 2 || def.length < 4) return null;
  if (INSTRUCTION_PREFIX.test(line)) return null;
  return { term, def };
}

function parseListAfterLead(line: string): { topic: string; items: string } | null {
  const m = line.match(
    /^(?:.{0,80}?)(?:sur|à propos de|concernant|autour de)\s+(.+?)\s*[:：\-–—]\s*(.+)$/i
  );
  if (m) {
    return { topic: m[1].trim(), items: m[2].trim() };
  }
  const stripped = stripInstructionLead(line);
  const colon = stripped.match(/^(.{3,70}?)\s*[:：]\s*(.+)$/);
  if (colon && /[,;\/]| et /.test(colon[2])) {
    return { topic: colon[1].trim(), items: colon[2].trim() };
  }
  return null;
}

function clozeCard(line: string, matiere: string): { front: string; back: string } | null {
  const words = line.split(/\s+/);
  if (words.length < 6) return null;
  const start = Math.max(1, Math.floor(words.length / 3));
  const end = Math.min(words.length - 1, Math.floor((2 * words.length) / 3));
  if (end <= start) return null;
  const hidden = words.slice(start, end).join(" ");
  if (hidden.length < 3) return null;
  const prompt = line.replace(hidden, "……");
  return {
    front: `Complète (${matiere}) : ${prompt}`,
    back: line.replace(/[.!?…]+$/, ""),
  };
}

function cardsFromText(text: string, matiere: string): FlashCard[] {
  const cards: FlashCard[] = [];
  const chunks = splitChunks(text);

  for (const raw of chunks.slice(0, 24)) {
    if (cards.length >= 14) break;
    const line = raw.replace(/^\d+[\).\:\-–—]\s*/, "").trim();
    if (line.length < 8) continue;
    if (/^\(contenu à récupérer\)$/i.test(line)) continue;

    // Déjà une vraie question dans le devoir
    if (looksLikeQuestion(line) && /[?？]/.test(line)) {
      const parts = line.split(/\s*[:：]\s*/);
      if (parts.length >= 2 && parts[0].includes("?")) {
        pushCard(
          cards,
          parts[0],
          parts.slice(1).join(" : "),
          "Réponds sans regarder le verso.",
          matiere
        );
        continue;
      }
    }

    const def = parseDefinition(line);
    if (def && !INSTRUCTION_PREFIX.test(def.term)) {
      // Ignore "Histoire [ÉVAL] (date) : consigne" — term contient une date
      if (/\(\d{4}-\d{2}-\d{2}\)/.test(def.term)) {
        // Traite seulement la partie droite (consigne / contenu utile)
        const inner = cardsFromText(def.def, matiere);
        for (const c of inner) {
          if (cards.length >= 14) break;
          if (!cards.some((x) => x.front === c.front)) {
            cards.push({ ...c, id: `fb-${cards.length}` });
          }
        }
        continue;
      }
      pushCard(
        cards,
        `Qu'est-ce que ${def.term} ?`,
        def.def,
        "Dis la définition à voix haute.",
        matiere
      );
      continue;
    }

    const est = parseEstSentence(line);
    if (est) {
      pushCard(
        cards,
        `Qu'est-ce que ${est.term} ?`,
        est.def,
        "Réponds avec tes mots, puis vérifie.",
        matiere
      );
      continue;
    }

    const list = parseListAfterLead(line);
    if (list && list.items.length >= 8) {
      pushCard(
        cards,
        `Cite les points importants sur ${list.topic}`,
        list.items,
        "Énumère-les sans regarder.",
        matiere
      );
      continue;
    }

    // Consigne pure sans savoir extractible → question de mission
    if (INSTRUCTION_PREFIX.test(line)) {
      const rest = stripInstructionLead(line);
      const defs = rest.match(
        /d[ée]finition(?:s)?\s+((?:du|de\s+la|de\s+l['’]|des|de)\s+.+)/i
      );
      if (defs) {
        const topics = defs[1]
          .replace(/[.!?…]+$/, "")
          .replace(/^(du|de la|de l['’]|des|de)\s+/i, "")
          .replace(/\s+et\s+de\s+(l['’]|la\s+)?/gi, " et ")
          .replace(/\s+et\s+du\s+/gi, " et ");
        pushCard(
          cards,
          `Quelles définitions dois-tu connaître en ${matiere} ?`,
          topics.charAt(0).toUpperCase() + topics.slice(1),
          "Écris chaque définition sur une feuille, puis compare au cours.",
          matiere
        );
        continue;
      }
      if (rest.length >= 10) {
        pushCard(
          cards,
          `Que dois-tu travailler en ${matiere} ?`,
          rest,
          "Si le devoir ne donne pas les notions, ajoute une photo du cours.",
          matiere
        );
      }
      continue;
    }

    const cloze = clozeCard(line, matiere);
    if (cloze) {
      pushCard(cards, cloze.front, cloze.back, "Relis le cours, puis redis.", matiere);
    }
  }

  if (cards.length === 0) {
    pushCard(
      cards,
      `Que dois-tu retenir en ${matiere} ?`,
      text.slice(0, 280) || "Relis ton cours et note 3 idées clés.",
      "Écris 3 mots-clés sur une feuille.",
      matiere
    );
  }

  return cards.slice(0, 14);
}

/** Carte depuis un devoir : on utilise UNIQUEMENT le contenu, jamais « Matière (date) ». */
function cardsFromHomeworkItem(item: HomeworkItem): FlashCard[] {
  const contenu = cleanText(item.contenu || "");
  if (!contenu || /^\(contenu à récupérer\)$/i.test(contenu)) {
    return [
      {
        id: "tmp",
        front: ensureQuestionFront(
          `Que faut-il préparer pour ${item.matiere} le ${item.date} ?`,
          item.matiere
        ),
        back: item.interrogation
          ? "Le contenu du contrôle n’est pas détaillé sur ÉcoleDirecte — prends une photo du cours."
          : "Le détail du devoir manque — utilise « Photo ou texte de cours ».",
        tip: "Ajoute le cours en photo pour de vraies questions.",
      },
    ];
  }
  return cardsFromText(contenu, item.matiere);
}

export function fallbackFromHomework(items: HomeworkItem[]): FlashDeck {
  const priority = [...items].sort((a, b) => {
    if (a.interrogation !== b.interrogation) return a.interrogation ? -1 : 1;
    return a.date.localeCompare(b.date);
  });
  const main = priority[0];
  const matiere = main?.matiere || "Révision";
  const hasEval = priority.some((d) => d.interrogation);

  const cards: FlashCard[] = [];
  for (const item of priority) {
    for (const c of cardsFromHomeworkItem(item)) {
      if (cards.length >= 14) break;
      if (cards.some((x) => x.front === c.front && x.back === c.back)) continue;
      cards.push({ ...c, id: `fb-${cards.length}` });
    }
    if (cards.length >= 14) break;
  }

  if (cards.length === 0) {
    cards.push({
      id: "fb-0",
      front: ensureQuestionFront(`Que dois-tu réviser en ${matiere} ?`, matiere),
      back: "Aucun devoir sélectionné — choisis un devoir ou envoie une photo de cours.",
      tip: "Utilise le mode photo pour créer de vraies questions.",
    });
  }

  return {
    id: `deck-${Date.now()}`,
    title: hasEval ? `Préparer l’éval — ${matiere}` : `Réviser — ${matiere}`,
    matiere,
    source: "devoirs",
    createdAt: new Date().toISOString(),
    cards,
    mission: hasEval
      ? `Objectif : être prête pour le contrôle de ${matiere}.`
      : `Objectif : bien comprendre le devoir de ${matiere}.`,
    howTo: [
      "Lis la question sur la carte.",
      "Réponds à voix haute (sans regarder).",
      "Retourne pour vérifier.",
      "Si c’est faux : refais 2 fois, puis passe à la suivante.",
    ],
  };
}

export function fallbackFromCourse(
  text: string,
  matiere = "Cours"
): FlashDeck {
  const cards = cardsFromText(text, matiere).map((c, i) => ({
    ...c,
    id: `fb-${i}`,
  }));
  return {
    id: `deck-${Date.now()}`,
    title: `Cartes — ${matiere}`,
    matiere,
    source: "cours",
    createdAt: new Date().toISOString(),
    cards,
    mission: `Objectif : retenir l’essentiel de ton cours de ${matiere}.`,
    howTo: [
      "Une carte = une question claire.",
      "Réponds sans tricher, puis vérifie.",
      "Les cartes ratées : refais-les à la fin.",
    ],
  };
}
