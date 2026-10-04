import type { HomeworkItem } from "@/lib/ecoledirecte/types";
import type { FlashCard, FlashDeck } from "./types";

function splitSentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12 && s.length <= 220);
}

function cardsFromText(text: string, matiere: string): FlashCard[] {
  const lines = splitSentences(text);
  const cards: FlashCard[] = [];
  let i = 0;

  for (const line of lines.slice(0, 16)) {
    const colon = line.match(/^(.{3,60}?)\s*[:：]\s*(.+)$/);
    if (colon) {
      cards.push({
        id: `fb-${i++}`,
        front: `${matiere} — ${colon[1].trim()} ?`,
        back: colon[2].trim(),
        tip: "Dis la réponse à voix haute avant de retourner.",
      });
      continue;
    }
    const words = line.split(/\s+/);
    if (words.length < 5) continue;
    const hide = words.slice(Math.floor(words.length / 3), Math.floor((2 * words.length) / 3)).join(" ");
    cards.push({
      id: `fb-${i++}`,
      front: `Complète (${matiere}) : ${line.replace(hide, "……")}`,
      back: line,
      tip: "Relis le cours, puis redis avec tes mots.",
    });
  }

  if (cards.length === 0) {
    cards.push({
      id: "fb-0",
      front: `Que dois-tu retenir en ${matiere} ?`,
      back: text.slice(0, 280) || "Relis ton cours et note 3 idées clés.",
      tip: "Écris 3 mots-clés sur une feuille.",
    });
  }

  return cards.slice(0, 14);
}

export function fallbackFromHomework(
  items: HomeworkItem[]
): FlashDeck {
  const priority = [...items].sort((a, b) => {
    if (a.interrogation !== b.interrogation) return a.interrogation ? -1 : 1;
    return a.date.localeCompare(b.date);
  });
  const main = priority[0];
  const matiere = main?.matiere || "Révision";
  const blob = priority
    .map(
      (d) =>
        `${d.matiere}${d.interrogation ? " [ÉVAL]" : ""} (${d.date}) : ${d.contenu}`
    )
    .join("\n\n");

  const cards = cardsFromText(blob, matiere);
  const hasEval = priority.some((d) => d.interrogation);

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
  const cards = cardsFromText(text, matiere);
  return {
    id: `deck-${Date.now()}`,
    title: `Cartes — ${matiere}`,
    matiere,
    source: "cours",
    createdAt: new Date().toISOString(),
    cards,
    mission: `Objectif : retenir l’essentiel de ton cours de ${matiere}.`,
    howTo: [
      "Une carte = une idée importante.",
      "Réponds sans tricher, puis vérifie.",
      "Les cartes ratées : refais-les à la fin.",
    ],
  };
}
