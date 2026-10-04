import {
  AlertTriangle,
  Backpack,
  BookOpen,
  CalendarClock,
  ClipboardList,
  FileText,
  Layers,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";

export type EcoleModule = {
  id: string;
  href: string;
  label: string;
  blurb: string;
  icon: LucideIcon;
  tone: "sky" | "rose" | "amber" | "teal" | "indigo" | "orange" | "emerald";
  badge?: string;
  external?: boolean;
};

const TONE: Record<
  EcoleModule["tone"],
  { icon: string; soft: string; ring: string }
> = {
  sky: {
    icon: "from-sky-400 to-blue-500",
    soft: "from-sky-100/90 via-white/50 to-transparent",
    ring: "ring-sky-200/60",
  },
  rose: {
    icon: "from-rose-400 to-orange-400",
    soft: "from-rose-100/90 via-white/50 to-transparent",
    ring: "ring-rose-200/60",
  },
  amber: {
    icon: "from-amber-400 to-orange-500",
    soft: "from-amber-100/90 via-white/50 to-transparent",
    ring: "ring-amber-200/60",
  },
  teal: {
    icon: "from-teal-400 to-emerald-500",
    soft: "from-teal-100/90 via-white/50 to-transparent",
    ring: "ring-teal-200/60",
  },
  indigo: {
    icon: "from-indigo-400 to-blue-600",
    soft: "from-indigo-100/90 via-white/50 to-transparent",
    ring: "ring-indigo-200/60",
  },
  orange: {
    icon: "from-orange-400 to-amber-500",
    soft: "from-orange-100/90 via-white/50 to-transparent",
    ring: "ring-orange-200/60",
  },
  emerald: {
    icon: "from-emerald-400 to-teal-500",
    soft: "from-emerald-100/90 via-white/50 to-transparent",
    ring: "ring-emerald-200/60",
  },
};

export function moduleTone(tone: EcoleModule["tone"]) {
  return TONE[tone];
}

/** Options utiles pour une élève de 6e — priorisées pédagogie + quotidien. */
export const ECOLE_MODULES: EcoleModule[] = [
  {
    id: "devoirs",
    href: "/devoirs",
    label: "Devoirs",
    blurb: "Cahier de texte, à faire / fait",
    icon: BookOpen,
    tone: "sky",
  },
  {
    id: "evals",
    href: "/devoirs",
    label: "Évaluations",
    blurb: "Les contrôles à préparer",
    icon: AlertTriangle,
    tone: "rose",
    badge: "Priorité",
  },
  {
    id: "flashcards",
    href: "/flashcards",
    label: "Flashcards",
    blurb: "Devoirs ou photo → cartes",
    icon: Layers,
    tone: "indigo",
  },
  {
    id: "focus",
    href: "/ecole/focus",
    label: "Focus",
    blurb: "Minuteur de révision guidé",
    icon: Timer,
    tone: "amber",
  },
  {
    id: "notes",
    href: "/ecole/notes",
    label: "Notes",
    blurb: "Moyennes & dernières notes",
    icon: ClipboardList,
    tone: "teal",
  },
  {
    id: "edt",
    href: "/ecole/edt",
    label: "Emploi du temps",
    blurb: "Cours d’aujourd’hui & demain",
    icon: CalendarClock,
    tone: "orange",
  },
  {
    id: "vie",
    href: "/ecole/vie",
    label: "Vie scolaire",
    blurb: "Absences, retards, messages",
    icon: FileText,
    tone: "emerald",
  },
  {
    id: "sac",
    href: "/routine/sac",
    label: "Sac",
    blurb: "Quoi mettre demain",
    icon: Backpack,
    tone: "sky",
  },
  {
    id: "astuce",
    href: "/ecole/focus",
    label: "Astuce du jour",
    blurb: "Petite méthode pour mieux retenir",
    icon: Sparkles,
    tone: "indigo",
  },
];
