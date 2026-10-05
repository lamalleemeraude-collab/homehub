import type { HomeworkItem } from "@/lib/ecoledirecte/types";
import {
  ensureQuestionFront,
  fallbackFromCourse,
  fallbackFromHomework,
} from "./fallback-generate";
import type {
  FlashCard,
  FlashDeck,
  GenerateFlashcardsResponse,
} from "./types";

const SYSTEM = `Tu es un coach de révision pour une élève de 6e (collège, France).
Tu crées des flashcards CLAIRES, COURTES, EXHAUSTIVES sur ce qu'il faut savoir.

Règles OBLIGATOIRES :
- Français simple, phrases courtes.
- Recto (front) = TOUJOURS une vraie question d'interrogation qui se termine par "?" (ou "Complète… : …").
  Exemples OK : "Qu'est-ce que le périmètre ?", "Cite 3 causes de la Révolution.", "Complète : Un carré a …… côtés égaux."
  INTERDIT : recopier la consigne du devoir, un titre, une date, "Histoire (2026-10-08)", ou un énoncé sans "?".
- Verso (back) = réponse exacte et complète (le savoir à mémoriser), PAS la consigne "apprendre / réviser…".
- Si le devoir ne contient que des consignes sans leçons : invente des questions de révision UNIQUEMENT à partir des notions explicitement citées ; sinon dis clairement qu'il faut le cours.
- Couvre TOUT le contenu important : définitions, dates, règles, conjugaisons, formules, vocabulaire, étapes.
- Pour une interrogation/contrôle : priorise ce qui tombe sûrement.
- 8 à 16 cartes (assez pour réviser, pas trop pour l'élève).
- Ajoute une "tip" courte (conseil méthode) sur chaque carte.
- mission = 1 phrase : ce que l'élève doit faire / réussir.
- howTo = 3 à 5 étapes très concrètes pour utiliser le paquet.

Réponds UNIQUEMENT en JSON :
{
  "title": string,
  "matiere": string,
  "mission": string,
  "howTo": string[],
  "cards": [{ "front": string, "back": string, "tip": string }]
}`;

type AiDeck = {
  title?: string;
  matiere?: string;
  mission?: string;
  howTo?: string[];
  cards?: { front?: string; back?: string; tip?: string }[];
};

function normalizeDeck(
  parsed: AiDeck,
  source: FlashDeck["source"],
  fallbackMatiere: string
): FlashDeck {
  const cards: FlashCard[] = (parsed.cards ?? [])
    .filter((c) => c.front?.trim() && c.back?.trim())
    .slice(0, 16)
    .map((c, i) => ({
      id: `c-${i}`,
      front: ensureQuestionFront(c.front!.trim(), fallbackMatiere),
      back: c.back!.trim(),
      tip: c.tip?.trim() || undefined,
    }))
    // Rejette les cartes où le verso n'est qu'une consigne vide de savoir
    .filter((c) => {
      const back = c.back.toLowerCase();
      const instructionOnly =
        /^(réviser|revoir|apprendre|lire|faire|compléter)\b/.test(back) &&
        back.length < 80 &&
        !/[:=]/.test(c.back);
      return !instructionOnly;
    });

  if (cards.length === 0) {
    throw new Error("Aucune carte générée");
  }

  return {
    id: `deck-${Date.now()}`,
    title: parsed.title?.trim() || `Révision — ${fallbackMatiere}`,
    matiere: parsed.matiere?.trim() || fallbackMatiere,
    source,
    createdAt: new Date().toISOString(),
    cards,
    mission:
      parsed.mission?.trim() ||
      `Objectif : réviser ${fallbackMatiere} avec ces cartes.`,
    howTo:
      parsed.howTo?.filter(Boolean).slice(0, 6) ||
      [
        "Lis la question.",
        "Réponds à voix haute.",
        "Vérifie le verso.",
        "Refais les cartes ratées.",
      ],
  };
}

async function callOpenAI(
  userContent: string | Array<Record<string, unknown>>
): Promise<AiDeck> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("NO_KEY");

  const model =
    process.env.OPENAI_FLASH_MODEL ||
    process.env.OPENAI_MODEL ||
    "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: userContent,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Réponse vide");
  return JSON.parse(content) as AiDeck;
}

export async function generateFromHomework(
  items: HomeworkItem[]
): Promise<GenerateFlashcardsResponse> {
  if (items.length === 0) {
    return {
      ok: true,
      deck: fallbackFromHomework([]),
      source: "fallback",
      message: "Aucun devoir — cartes d’exemple.",
    };
  }

  const matiere = items[0].matiere;
  const listing = items
    .map(
      (d, i) =>
        `${i + 1}. [${d.interrogation ? "CONTRÔLE/INTERRO" : "devoir"}] ${d.matiere} — pour le ${d.date}\n${d.contenu}`
    )
    .join("\n\n");

  try {
    const parsed = await callOpenAI(
      `Crée un paquet de flashcards EXHAUSTIF pour cette élève de 6e à partir des devoirs / contrôles ÉcoleDirecte ci-dessous.
Priorité absolue aux contrôles et interrogations.
Extrais tout ce qu'il faut savoir et mémoriser.

${listing}`
    );
    return {
      ok: true,
      deck: normalizeDeck(parsed, "devoirs", matiere),
      source: "openai",
    };
  } catch (e) {
    const noKey = e instanceof Error && e.message === "NO_KEY";
    return {
      ok: true,
      deck: fallbackFromHomework(items),
      source: "fallback",
      message: noKey
        ? "Mode simple (ajoute OPENAI_API_KEY pour des cartes plus complètes)."
        : "IA indisponible — cartes créées à partir du texte des devoirs.",
    };
  }
}

export async function generateFromCourse(input: {
  text?: string;
  images?: string[];
  matiere?: string;
}): Promise<GenerateFlashcardsResponse> {
  const matiere = input.matiere?.trim() || "Cours";
  const text = input.text?.trim() || "";
  const images = (input.images || []).slice(0, 4);

  if (!text && images.length === 0) {
    return {
      ok: true,
      deck: fallbackFromCourse(
        "Pas de contenu — prends une photo de ton cours ou écris le texte.",
        matiere
      ),
      source: "fallback",
      message: "Ajoute une photo ou du texte de ton cours.",
    };
  }

  try {
    const parts: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: `Crée des flashcards exhaustives pour une élève de 6e.
Matière indiquée : ${matiere}
${text ? `Texte fourni par l'élève :\n${text}` : "Pas de texte — lis les photos de cours."}
Si photos : lis le tableau / le cahier, ignore les parties illisibles, invente rien d'important.`,
      },
    ];
    for (const url of images) {
      parts.push({
        type: "image_url",
        image_url: { url, detail: "high" },
      });
    }

    const parsed = await callOpenAI(parts);
    return {
      ok: true,
      deck: normalizeDeck(parsed, "cours", matiere),
      source: "openai",
    };
  } catch (e) {
    const noKey = e instanceof Error && e.message === "NO_KEY";
    return {
      ok: true,
      deck: fallbackFromCourse(
        text || "Contenu photo — décris ton cours en quelques lignes pour de meilleures cartes.",
        matiere
      ),
      source: "fallback",
      message: noKey
        ? "Mode simple (OPENAI_API_KEY manquant pour lire les photos)."
        : "IA indisponible — cartes à partir du texte saisi.",
    };
  }
}
