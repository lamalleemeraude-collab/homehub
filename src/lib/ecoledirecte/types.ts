export type HomeworkItem = {
  id: number;
  date: string;
  matiere: string;
  contenu: string;
  fait: boolean;
  interrogation: boolean;
  donneLe?: string;
  prof?: string;
};

export type EdQcmChallenge = {
  question: string;
  propositions: string[];
  propositionValues: string[];
  token: string;
  twoFaToken: string;
};

export type HomeworkResponse = {
  ok: true;
  eleve: string;
  syncedAt: string;
  count: number;
  devoirs: HomeworkItem[];
};

export type HomeworkErrorResponse = {
  ok: false;
  error: string;
  code?: number;
  hint?: string;
};
