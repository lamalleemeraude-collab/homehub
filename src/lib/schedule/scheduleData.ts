export type WeekDay = 1 | 2 | 3 | 4 | 5;

export type CourseKind =
  | "course"
  | "perm"
  | "self"
  | "cate"
  | "bilangue"
  | "group"
  | "devf"
  | "accompagnement"
  | "continuation";

export type BagTag =
  | "francais"
  | "mathematiques"
  | "anglais"
  | "allemand"
  | "bilangue"
  | "histoire-geo"
  | "svt"
  | "physique-chimie"
  | "eps"
  | "arts-plastiques"
  | "musique"
  | "vie-classe";

/** Couleurs fidèles au planning papier Dinard Sainte Marie */
export type SubjectColor =
  | "maths"
  | "francais"
  | "anglais"
  | "histoire-geo"
  | "eps"
  | "sciences"
  | "arts"
  | "musique"
  | "allemand"
  | "perm"
  | "devf"
  | "accompagnement"
  | "cate"
  | "self"
  | "vie-classe";

export type CellVariant = {
  group?: "A" | "B";
  track?: string;
  subject: string;
  shortLabel: string;
  teacher?: string;
  room?: string;
  color: SubjectColor;
  bagTags?: BagTag[];
};

export type TimetableSlot = {
  id: string;
  start: string;
  end: string;
  label: string;
};

export type TimetableCell = {
  kind: CourseKind;
  subject: string;
  shortLabel: string;
  teacher?: string;
  room?: string;
  note?: string;
  track?: string;
  color: SubjectColor;
  timeOverride?: { start: string; end: string };
  rowSpan?: number;
  variants?: CellVariant[];
  bagTags?: BagTag[];
};

export type TimetableStyle = {
  tile: string;
  text: string;
  badge?: string;
  header?: string;
};

export const SCHEDULE_META = {
  schoolYear: "2026-2027",
  grade: "6AR — Sixième Artémis",
  student: "Maelle",
  college: "Dinard Sainte Marie",
} as const;

export const DAY_NAMES: Record<WeekDay, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
};

export const TIME_SLOTS: TimetableSlot[] = [
  { id: "s1", start: "08:25", end: "09:20", label: "08:25 – 09:20" },
  { id: "s2", start: "09:25", end: "10:20", label: "09:25 – 10:20" },
  { id: "s3", start: "10:35", end: "11:30", label: "10:35 – 11:30" },
  { id: "s4", start: "11:35", end: "12:30", label: "11:35 – 12:30" },
  { id: "s5", start: "13:55", end: "14:50", label: "13:55 – 14:50" },
  { id: "s6", start: "14:55", end: "15:50", label: "14:55 – 15:50" },
  { id: "s7", start: "16:05", end: "17:00", label: "16:05 – 17:00" },
];

/** Séparation matin / après-midi — comme sur le planning papier */
export const LUNCH_BREAK = {
  id: "lunch",
  start: "12:30",
  end: "13:55",
  label: "12:30 – 13:55",
  title: "Pause méridienne",
} as const;

export const MORNING_RECESS = {
  id: "morning-recess",
  start: "10:20",
  end: "10:35",
  label: "10:20 – 10:35",
  title: "Récréation",
} as const;

export const AFTERNOON_RECESS = {
  id: "afternoon-recess",
  start: "15:50",
  end: "16:05",
  label: "15:50 – 16:05",
  title: "Récréation",
} as const;

export type TimetableBreakKind = "recess" | "lunch";

export type TimetableBreak = {
  id: string;
  start: string;
  end: string;
  label: string;
  title: string;
  kind: TimetableBreakKind;
  afterSlotIndex: number;
};

/** Pauses affichées entre les créneaux (récrés + déjeuner) */
export const TIMETABLE_BREAKS: TimetableBreak[] = [
  { ...MORNING_RECESS, kind: "recess", afterSlotIndex: 1 },
  { ...LUNCH_BREAK, kind: "lunch", afterSlotIndex: 3 },
  { ...AFTERNOON_RECESS, kind: "recess", afterSlotIndex: 5 },
];

/** @deprecated Utiliser TIMETABLE_BREAKS */
export const LUNCH_BREAK_AFTER_SLOT_INDEX = 3;

export const SUBJECT_COLORS: Record<SubjectColor, TimetableStyle> = {
  maths: {
    tile: "border-cyan-700 bg-cyan-100",
    text: "text-slate-900",
    badge: "bg-cyan-700 text-white",
  },
  francais: {
    tile: "border-pink-500 bg-pink-100",
    text: "text-slate-900",
    badge: "bg-pink-600 text-white",
  },
  anglais: {
    tile: "border-blue-800 bg-blue-100",
    text: "text-slate-900",
    badge: "bg-blue-800 text-white",
  },
  "histoire-geo": {
    tile: "border-amber-600 bg-amber-100",
    text: "text-slate-900",
    badge: "bg-amber-600 text-white",
  },
  eps: {
    tile: "border-lime-600 bg-lime-100",
    text: "text-slate-900",
    badge: "bg-lime-600 text-white",
  },
  sciences: {
    tile: "border-fuchsia-700 bg-fuchsia-100",
    text: "text-slate-900",
    badge: "bg-fuchsia-700 text-white",
  },
  arts: {
    tile: "border-green-700 bg-green-100",
    text: "text-slate-900",
    badge: "bg-green-700 text-white",
  },
  musique: {
    tile: "border-lime-700 bg-lime-100",
    text: "text-slate-900",
    badge: "bg-lime-700 text-white",
  },
  allemand: {
    tile: "border-green-600 bg-green-100",
    text: "text-slate-900",
    badge: "bg-green-600 text-white",
  },
  perm: {
    tile: "border-slate-400 bg-slate-200",
    text: "text-slate-800",
    badge: "bg-slate-500 text-white",
  },
  devf: {
    tile: "border-pink-400 bg-pink-100",
    text: "text-slate-900",
    badge: "bg-pink-500 text-white",
  },
  accompagnement: {
    tile: "border-orange-500 bg-orange-100",
    text: "text-slate-900",
    badge: "bg-orange-600 text-white",
  },
  cate: {
    tile: "border-orange-600 bg-orange-100",
    text: "text-slate-900",
    badge: "bg-orange-600 text-white",
  },
  self: {
    tile: "border-slate-400 bg-slate-100",
    text: "text-slate-800",
    badge: "bg-slate-500 text-white",
  },
  "vie-classe": {
    tile: "border-yellow-700 bg-yellow-100",
    text: "text-slate-900",
    badge: "bg-yellow-700 text-white",
  },
};

export const GROUP_BADGE: Record<"A" | "B", string> = {
  A: "bg-indigo-600 text-white",
  B: "bg-fuchsia-600 text-white",
};

/** Emploi du temps 6AR — année scolaire 2026/2027 (fidèle au planning papier) */
export const WEEKLY_SCHEDULE: Record<WeekDay, (TimetableCell | null)[]> = {
  1: [
    {
      kind: "course",
      subject: "Éducation physique & sport",
      shortLabel: "ED. PHYSIQUE & SPORT",
      teacher: "PAUL A.",
      color: "eps",
      timeOverride: { start: "08:25", end: "10:20" },
      rowSpan: 2,
      bagTags: ["eps"],
    },
    null,
    {
      kind: "course",
      subject: "Anglais LV1",
      shortLabel: "ANGLAIS LV1",
      teacher: "PRULHIERE J.",
      room: "S114",
      color: "anglais",
      bagTags: ["anglais"],
    },
    {
      kind: "group",
      subject: "Catéchèse / Self",
      shortLabel: "CATE / SELF",
      color: "cate",
      variants: [
        {
          subject: "Catéchèse pastorale",
          shortLabel: "CATE PASTORALE S.",
          teacher: "Pasto",
          room: "6CATE-R",
          color: "cate",
        },
        {
          subject: "Self",
          shortLabel: "SELF",
          room: "6LNONCATE",
          color: "self",
        },
      ],
    },
    {
      kind: "group",
      subject: "Bilangue / Permanence",
      shortLabel: "BILANGUE / PERM",
      color: "allemand",
      variants: [
        {
          subject: "Bilangue allemand",
          shortLabel: "BILANGUE ALLEMAND",
          teacher: "TRENS S.",
          room: "S204",
          color: "allemand",
          bagTags: ["bilangue", "allemand"],
        },
        {
          subject: "Permanence",
          shortLabel: "PERM",
          room: "S001",
          track: "6AR_NON_BIL",
          color: "perm",
        },
      ],
    },
    {
      kind: "devf",
      subject: "Devoirs facultatifs",
      shortLabel: "DEVF",
      color: "devf",
      variants: [
        {
          subject: "Devoirs facultatifs",
          shortLabel: "DEVF",
          teacher: "D.G.",
          room: "S114",
          track: "6AR CLASSE ENTIERE",
          color: "devf",
        },
        {
          subject: "Devoirs facultatifs",
          shortLabel: "DEVF",
          teacher: "F.D.",
          room: "S114",
          track: "6AR NON BIL",
          color: "devf",
        },
        {
          subject: "Devoirs facultatifs",
          shortLabel: "DEVF",
          teacher: "T.S.",
          room: "S114",
          track: "6AR NON BIL",
          color: "devf",
        },
      ],
    },
    {
      kind: "course",
      subject: "Mathématiques",
      shortLabel: "MATHEMATIQUES",
      teacher: "GILBERT M.",
      room: "S114",
      color: "maths",
      bagTags: ["mathematiques"],
    },
  ],
  2: [
    {
      kind: "perm",
      subject: "Permanence",
      shortLabel: "PERM",
      room: "S001",
      color: "perm",
    },
    {
      kind: "course",
      subject: "Anglais LV1",
      shortLabel: "ANGLAIS LV1",
      teacher: "PRULHIERE J.",
      room: "S114",
      color: "anglais",
      bagTags: ["anglais"],
    },
    {
      kind: "group",
      subject: "Vie de classe / Accompagnement",
      shortLabel: "VIE CLASSE / ACCOMP.",
      color: "vie-classe",
      variants: [
        {
          group: "A",
          subject: "Heure de vie de classe",
          shortLabel: "HEURE VIE CLASSE",
          teacher: "ALLENET M.",
          room: "S114",
          color: "vie-classe",
          bagTags: ["vie-classe"],
        },
        {
          group: "B",
          subject: "Accompagnement personnalisé français",
          shortLabel: "Accomp. personnalisé Fr",
          teacher: "ALLENET M.",
          room: "S114",
          color: "accompagnement",
          bagTags: ["francais"],
        },
      ],
    },
    {
      kind: "course",
      subject: "Sciences vie & terre",
      shortLabel: "SCIENCES VIE & TERRE",
      teacher: "LE MERRER L.",
      room: "S109",
      color: "sciences",
      bagTags: ["svt"],
    },
    {
      kind: "course",
      subject: "Histoire-Géographie",
      shortLabel: "HISTOIRE-GEOGRAPHIE",
      teacher: "BARON A.",
      room: "S114",
      color: "histoire-geo",
      bagTags: ["histoire-geo"],
    },
    {
      kind: "group",
      subject: "Maths / Français",
      shortLabel: "MATHS / FRANC",
      color: "maths",
      variants: [
        {
          group: "A",
          subject: "Mathématiques",
          shortLabel: "MATHS",
          teacher: "G.M.",
          room: "S114",
          track: "6AR CLASSE ENTIERE",
          color: "maths",
          bagTags: ["mathematiques"],
        },
        {
          group: "B",
          subject: "Français",
          shortLabel: "FRANC",
          teacher: "A.M.",
          room: "S114",
          track: "6AR GROUPE 1",
          color: "francais",
          bagTags: ["francais"],
        },
        {
          group: "B",
          subject: "Mathématiques",
          shortLabel: "MATHS",
          teacher: "G.M.",
          room: "S115",
          track: "6AR GROUPE 2",
          color: "maths",
          bagTags: ["mathematiques"],
        },
      ],
    },
    {
      kind: "group",
      subject: "Français / Maths",
      shortLabel: "FRANC / MATHS",
      color: "francais",
      variants: [
        {
          group: "A",
          subject: "Français",
          shortLabel: "FRANC",
          teacher: "A.M.",
          room: "S114",
          track: "6AR CLASSE ENTIERE",
          color: "francais",
          bagTags: ["francais"],
        },
        {
          group: "B",
          subject: "Français",
          shortLabel: "FRANC",
          teacher: "A.M.",
          room: "S114",
          track: "6AR GROUPE 2",
          color: "francais",
          bagTags: ["francais"],
        },
        {
          group: "B",
          subject: "Mathématiques",
          shortLabel: "MATHS",
          teacher: "G.M.",
          room: "S115",
          track: "6AR GROUPE 1",
          color: "maths",
          bagTags: ["mathematiques"],
        },
      ],
    },
  ],
  3: [
    {
      kind: "course",
      subject: "Anglais LV1",
      shortLabel: "ANGLAIS LV1",
      teacher: "PRULHIERE J.",
      room: "S114",
      color: "anglais",
      bagTags: ["anglais"],
    },
    {
      kind: "course",
      subject: "Arts plastiques",
      shortLabel: "ARTS PLASTIQUES",
      teacher: "CAFFIER Z.",
      room: "S003",
      color: "arts",
      bagTags: ["arts-plastiques"],
    },
    {
      kind: "course",
      subject: "Français",
      shortLabel: "FRANCAIS",
      teacher: "ALLENET M.",
      room: "S114",
      color: "francais",
      timeOverride: { start: "10:35", end: "12:30" },
      rowSpan: 2,
      bagTags: ["francais"],
    },
    null,
    null,
    null,
    null,
  ],
  4: [
    {
      kind: "course",
      subject: "Mathématiques",
      shortLabel: "MATHEMATIQUES",
      teacher: "GILBERT M.",
      room: "S114",
      color: "maths",
      bagTags: ["mathematiques"],
    },
    {
      kind: "group",
      subject: "Physique-Chimie / SVT",
      shortLabel: "PC / SVT",
      color: "sciences",
      variants: [
        {
          group: "A",
          subject: "Physique-Chimie",
          shortLabel: "PHYSIQUE-CHIMIE",
          teacher: "BODRAIS F.",
          room: "S110",
          color: "sciences",
          bagTags: ["physique-chimie"],
        },
        {
          group: "B",
          subject: "Sciences vie & terre",
          shortLabel: "SCIENCES VIE & TERRE",
          teacher: "LE MERRER L.",
          room: "S109",
          color: "sciences",
          bagTags: ["svt"],
        },
      ],
    },
    {
      kind: "group",
      subject: "Français / Mathématiques",
      shortLabel: "FRANCAIS / MATHS",
      color: "francais",
      variants: [
        {
          group: "A",
          subject: "Français",
          shortLabel: "FRANCAIS",
          teacher: "ALLENET M.",
          room: "S114",
          color: "francais",
          bagTags: ["francais"],
        },
        {
          group: "B",
          subject: "Mathématiques",
          shortLabel: "MATHEMATIQUES",
          teacher: "GILBERT M.",
          room: "S114",
          color: "maths",
          bagTags: ["mathematiques"],
        },
      ],
    },
    {
      kind: "bilangue",
      subject: "Bilangue allemand",
      shortLabel: "BILANGUE ALLEMAND",
      teacher: "TRENS S.",
      room: "S204",
      track: "6AR ALLBIL 6",
      color: "allemand",
      bagTags: ["bilangue", "allemand"],
    },
    {
      kind: "course",
      subject: "Histoire-Géographie",
      shortLabel: "HISTOIRE-GEOGRAPHIE",
      teacher: "BARON A.",
      room: "S114",
      color: "histoire-geo",
      bagTags: ["histoire-geo"],
    },
    {
      kind: "course",
      subject: "Physique-Chimie",
      shortLabel: "PHYSIQUE-CHIMIE",
      teacher: "BODRAIS F.",
      room: "S110",
      color: "sciences",
      bagTags: ["physique-chimie"],
    },
    {
      kind: "group",
      subject: "Accompagnement / Permanence",
      shortLabel: "ACCOMP. / PERM",
      color: "accompagnement",
      variants: [
        {
          group: "A",
          subject: "Accompagnement personnalisé maths",
          shortLabel: "Accomp. personnalisé Ma",
          teacher: "GILBERT M.",
          room: "S114",
          color: "accompagnement",
          bagTags: ["mathematiques"],
        },
        {
          group: "B",
          subject: "Permanence",
          shortLabel: "PERM",
          room: "S002",
          color: "perm",
        },
      ],
    },
  ],
  5: [
    {
      kind: "course",
      subject: "Français",
      shortLabel: "FRANCAIS",
      teacher: "ALLENET M.",
      room: "S114",
      color: "francais",
      bagTags: ["francais"],
    },
    {
      kind: "course",
      subject: "Mathématiques",
      shortLabel: "MATHEMATIQUES",
      teacher: "GILBERT M.",
      room: "S114",
      color: "maths",
      bagTags: ["mathematiques"],
    },
    {
      kind: "course",
      subject: "Éducation physique & sport",
      shortLabel: "ED. PHYSIQUE & SPORT",
      teacher: "PAUL A.",
      color: "eps",
      timeOverride: { start: "10:35", end: "12:30" },
      rowSpan: 2,
      bagTags: ["eps"],
    },
    null,
    {
      kind: "course",
      subject: "Histoire-Géographie",
      shortLabel: "HISTOIRE-GEOGRAPHIE",
      teacher: "BARON A.",
      room: "S114",
      color: "histoire-geo",
      bagTags: ["histoire-geo"],
    },
    {
      kind: "course",
      subject: "Éducation musicale",
      shortLabel: "EDUCATION MUSICALE",
      teacher: "TANGUY S.",
      room: "S102",
      color: "musique",
      bagTags: ["musique"],
    },
    {
      kind: "course",
      subject: "Anglais LV1",
      shortLabel: "ANGLAIS LV1",
      teacher: "PRULHIERE J.",
      room: "S114",
      color: "anglais",
      bagTags: ["anglais"],
    },
  ],
};
