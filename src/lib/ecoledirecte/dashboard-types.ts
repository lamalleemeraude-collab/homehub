import type { EdQcmChallenge, HomeworkItem } from "./types";

export type DashboardGrade = {
  matiere: string;
  note: string;
  sur: string;
  date?: string;
  devoir?: string;
};

export type DashboardCourse = {
  matiere: string;
  debut: string;
  fin: string;
  salle?: string;
  prof?: string;
  annule?: boolean;
};

export type DashboardAbsence = {
  type: string;
  date: string;
  libelle: string;
  justifie: boolean;
};

export type StudentDashboard = {
  ok: true;
  eleve: string;
  syncedAt: string;
  mission?: {
    title: string;
    matiere: string;
    date: string;
    interrogation: boolean;
  };
  stats: {
    devoirsRestants: number;
    evals: number;
    absencesNonJustifiees: number;
  };
  prochainesEvals: HomeworkItem[];
  dernieresNotes: DashboardGrade[];
  coursAujourdhui: DashboardCourse[];
  absences: DashboardAbsence[];
};

export type DashboardResult = StudentDashboard | { qcm: EdQcmChallenge };
