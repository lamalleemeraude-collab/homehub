/**
 * Hub élève — 1 seul login (devoirs).
 * Notes / EDT / vie : pages dédiées (extras) pour ne pas multiplier les connexions.
 */

import { fetchHomeworkList } from "./client";
import type { DashboardResult, StudentDashboard } from "./dashboard-types";
import { subjectStyle } from "./subjects";

export type {
  DashboardAbsence,
  DashboardCourse,
  DashboardGrade,
  StudentDashboard,
} from "./dashboard-types";

export async function fetchStudentDashboard(cookieFa?: {
  cn?: string;
  cv?: string;
  uuid?: string;
}): Promise<DashboardResult> {
  const homework = await fetchHomeworkList(cookieFa);
  if ("qcm" in homework) return homework;

  const todo = homework.devoirs.filter((d) => !d.fait);
  const evals = todo.filter((d) => d.interrogation);
  const next = [...todo].sort((a, b) => {
    if (a.interrogation !== b.interrogation) return a.interrogation ? -1 : 1;
    return a.date.localeCompare(b.date);
  })[0];

  const payload: StudentDashboard = {
    ok: true,
    eleve: homework.eleve,
    syncedAt: new Date().toISOString(),
    mission: next
      ? {
          title: next.contenu.split("\n")[0]?.slice(0, 100) || next.matiere,
          matiere: subjectStyle(next.matiere).short,
          date: next.date,
          interrogation: next.interrogation,
        }
      : undefined,
    stats: {
      devoirsRestants: todo.length,
      evals: evals.length,
      absencesNonJustifiees: 0,
    },
    prochainesEvals: evals.slice(0, 4),
    dernieresNotes: [],
    coursAujourdhui: [],
    absences: [],
  };

  return payload;
}
