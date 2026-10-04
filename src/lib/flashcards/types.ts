export type FlashCard = {
  id: string;
  front: string;
  back: string;
  tip?: string;
};

export type FlashDeck = {
  id: string;
  title: string;
  matiere: string;
  source: "devoirs" | "cours";
  createdAt: string;
  cards: FlashCard[];
  /** Ce que l’élève doit réviser (consigne claire). */
  mission: string;
  /** Étapes pour l’élève. */
  howTo: string[];
};

export type GenerateFromHomeworkRequest = {
  mode: "devoirs";
  /** IDs devoirs choisis ; vide = auto (évals + à faire). */
  homeworkIds?: number[];
};

export type GenerateFromCourseRequest = {
  mode: "cours";
  /** Texte saisi ou OCR. */
  text?: string;
  /** Image(s) en data URL (jpeg/png/webp). */
  images?: string[];
  matiere?: string;
};

export type GenerateFlashcardsRequest =
  | GenerateFromHomeworkRequest
  | GenerateFromCourseRequest;

export type GenerateFlashcardsResponse = {
  ok: true;
  deck: FlashDeck;
  source: "openai" | "fallback";
  message?: string;
};
