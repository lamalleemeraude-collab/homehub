/** Couleurs / libellés courts par matière — lisibles sur iPhone. */

export type SubjectStyle = {
  short: string;
  chip: string;
  bar: string;
  soft: string;
};

const DEFAULT: SubjectStyle = {
  short: "Cours",
  chip: "bg-slate-100 text-slate-800",
  bar: "from-slate-400 to-slate-500",
  soft: "from-slate-100/80 to-white/40",
};

const MAP: Record<string, SubjectStyle> = {
  anglais: {
    short: "Anglais",
    chip: "bg-sky-100 text-sky-900",
    bar: "from-sky-400 to-blue-500",
    soft: "from-sky-100/90 to-white/50",
  },
  allemand: {
    short: "Allemand",
    chip: "bg-amber-100 text-amber-950",
    bar: "from-amber-400 to-orange-500",
    soft: "from-amber-100/90 to-white/50",
  },
  mathematiques: {
    short: "Maths",
    chip: "bg-indigo-100 text-indigo-950",
    bar: "from-indigo-400 to-blue-600",
    soft: "from-indigo-100/90 to-white/50",
  },
  francais: {
    short: "Français",
    chip: "bg-rose-100 text-rose-950",
    bar: "from-rose-400 to-pink-500",
    soft: "from-rose-100/90 to-white/50",
  },
  histoire: {
    short: "Hist-Géo",
    chip: "bg-teal-100 text-teal-950",
    bar: "from-teal-400 to-emerald-500",
    soft: "from-teal-100/90 to-white/50",
  },
  sciences: {
    short: "SVT",
    chip: "bg-emerald-100 text-emerald-950",
    bar: "from-emerald-400 to-teal-500",
    soft: "from-emerald-100/90 to-white/50",
  },
  physique: {
    short: "EPS",
    chip: "bg-orange-100 text-orange-950",
    bar: "from-orange-400 to-amber-500",
    soft: "from-orange-100/90 to-white/50",
  },
  musique: {
    short: "Musique",
    chip: "bg-fuchsia-100 text-fuchsia-950",
    bar: "from-fuchsia-400 to-pink-500",
    soft: "from-fuchsia-100/80 to-white/50",
  },
  arts: {
    short: "Arts",
    chip: "bg-violet-100 text-violet-950",
    bar: "from-violet-400 to-indigo-500",
    soft: "from-violet-100/80 to-white/50",
  },
  techno: {
    short: "Techno",
    chip: "bg-cyan-100 text-cyan-950",
    bar: "from-cyan-400 to-sky-500",
    soft: "from-cyan-100/90 to-white/50",
  },
};

export function subjectStyle(matiere: string): SubjectStyle {
  const key = matiere
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (key.includes("anglais")) return MAP.anglais;
  if (key.includes("allemand") || key.includes("bilangue")) return MAP.allemand;
  if (key.includes("math")) return MAP.mathematiques;
  if (key.includes("francais")) return MAP.francais;
  if (key.includes("histoire") || key.includes("geo")) return MAP.histoire;
  if (key.includes("vie") || key.includes("terre") || key.includes("svt"))
    return MAP.sciences;
  if (key.includes("physique") || key.includes("sport") || key.includes("eps"))
    return MAP.physique;
  if (key.includes("musique")) return MAP.musique;
  if (key.includes("art") || key.includes("plast")) return MAP.arts;
  if (key.includes("techno")) return MAP.techno;

  return { ...DEFAULT, short: matiere.split(" ")[0] || DEFAULT.short };
}

export function formatHomeworkDay(dateIso: string): string {
  const d = new Date(`${dateIso}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const label = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (d.getTime() === today.getTime()) return `Aujourd’hui · ${label}`;
  if (d.getTime() === tomorrow.getTime()) return `Demain · ${label}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}
