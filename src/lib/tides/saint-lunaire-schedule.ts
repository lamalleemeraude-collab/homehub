/**
 * Horaires officiels indicatifs — Saint-Lunaire
 * Source : https://www.horaire-maree.fr/maree/Saint-Lunaire/
 * (Aviabag Météorem · port de référence Saint-Malo)
 */

export type TideScheduleRaw = {
  iso: string;
  type: "high" | "low";
  heightM: number;
  coefficient?: number;
};

/** Septembre 2026 — 10 prochains jours + jour courant. */
export const SAINT_LUNAIRE_TIDE_SCHEDULE: TideScheduleRaw[] = [
  // Mercredi 2 septembre 2026
  { iso: "2026-09-02T05:26:00+02:00", type: "low", heightM: 2.13, coefficient: 83 },
  { iso: "2026-09-02T11:00:00+02:00", type: "high", heightM: 11.78, coefficient: 83 },
  { iso: "2026-09-02T17:44:00+02:00", type: "low", heightM: 2.44, coefficient: 77 },
  { iso: "2026-09-02T23:21:00+02:00", type: "high", heightM: 11.57, coefficient: 77 },

  // Jeudi 3 septembre
  { iso: "2026-09-03T06:05:00+02:00", type: "low", heightM: 2.75, coefficient: 72 },
  { iso: "2026-09-03T11:42:00+02:00", type: "high", heightM: 11.16, coefficient: 72 },
  { iso: "2026-09-03T18:26:00+02:00", type: "low", heightM: 3.07, coefficient: 65 },

  // Vendredi 4 septembre
  { iso: "2026-09-04T00:06:00+02:00", type: "high", heightM: 10.76, coefficient: 59 },
  { iso: "2026-09-04T06:51:00+02:00", type: "low", heightM: 3.51, coefficient: 59 },
  { iso: "2026-09-04T12:32:00+02:00", type: "high", heightM: 10.35, coefficient: 53 },
  { iso: "2026-09-04T19:21:00+02:00", type: "low", heightM: 3.79, coefficient: 53 },

  // Samedi 5 septembre
  { iso: "2026-09-05T01:04:00+02:00", type: "high", heightM: 9.8, coefficient: 48 },
  { iso: "2026-09-05T07:52:00+02:00", type: "low", heightM: 4.28, coefficient: 48 },
  { iso: "2026-09-05T13:38:00+02:00", type: "high", heightM: 9.51, coefficient: 48 },
  { iso: "2026-09-05T20:37:00+02:00", type: "low", heightM: 4.4, coefficient: 48 },

  // Dimanche 6 septembre
  { iso: "2026-09-06T02:28:00+02:00", type: "high", heightM: 9.02, coefficient: 45 },
  { iso: "2026-09-06T09:23:00+02:00", type: "low", heightM: 4.78, coefficient: 45 },
  { iso: "2026-09-06T15:17:00+02:00", type: "high", heightM: 9.07, coefficient: 46 },
  { iso: "2026-09-06T22:23:00+02:00", type: "low", heightM: 4.49, coefficient: 46 },

  // Lundi 7 septembre
  { iso: "2026-09-07T04:18:00+02:00", type: "high", heightM: 8.98, coefficient: 50 },
  { iso: "2026-09-07T11:12:00+02:00", type: "low", heightM: 4.56, coefficient: 50 },
  { iso: "2026-09-07T16:56:00+02:00", type: "high", heightM: 9.46, coefficient: 55 },
  { iso: "2026-09-07T23:59:00+02:00", type: "low", heightM: 3.83, coefficient: 55 },

  // Mardi 8 septembre
  { iso: "2026-09-08T05:40:00+02:00", type: "high", heightM: 9.65, coefficient: 62 },
  { iso: "2026-09-08T12:31:00+02:00", type: "low", heightM: 3.73, coefficient: 62 },
  { iso: "2026-09-08T18:05:00+02:00", type: "high", heightM: 10.3, coefficient: 70 },

  // Mercredi 9 septembre
  { iso: "2026-09-09T01:03:00+02:00", type: "low", heightM: 2.88, coefficient: 77 },
  { iso: "2026-09-09T06:37:00+02:00", type: "high", heightM: 10.53, coefficient: 77 },
  { iso: "2026-09-09T13:26:00+02:00", type: "low", heightM: 2.8, coefficient: 84 },
  { iso: "2026-09-09T18:56:00+02:00", type: "high", heightM: 11.2, coefficient: 84 },

  // Jeudi 10 septembre
  { iso: "2026-09-10T01:52:00+02:00", type: "low", heightM: 2.01, coefficient: 90 },
  { iso: "2026-09-10T07:22:00+02:00", type: "high", heightM: 11.35, coefficient: 90 },
  { iso: "2026-09-10T14:10:00+02:00", type: "low", heightM: 2.02, coefficient: 95 },
  { iso: "2026-09-10T19:39:00+02:00", type: "high", heightM: 11.96, coefficient: 95 },

  // Vendredi 11 septembre
  { iso: "2026-09-11T02:33:00+02:00", type: "low", heightM: 1.4, coefficient: 99 },
  { iso: "2026-09-11T08:02:00+02:00", type: "high", heightM: 11.98, coefficient: 99 },
  { iso: "2026-09-11T14:50:00+02:00", type: "low", heightM: 1.49, coefficient: 101 },
  { iso: "2026-09-11T20:18:00+02:00", type: "high", heightM: 12.47, coefficient: 101 },

  // Samedi 12 septembre
  { iso: "2026-09-12T03:09:00+02:00", type: "low", heightM: 1.1, coefficient: 103 },
  { iso: "2026-09-12T08:38:00+02:00", type: "high", heightM: 12.36, coefficient: 103 },
  { iso: "2026-09-12T15:25:00+02:00", type: "low", heightM: 1.27, coefficient: 103 },
  { iso: "2026-09-12T20:54:00+02:00", type: "high", heightM: 12.68, coefficient: 103 },
];

export const TIDE_DATA_SOURCE_URL =
  "https://www.horaire-maree.fr/maree/Saint-Lunaire/";

export const TIDE_DATA_VALID_UNTIL = "2026-09-12";
