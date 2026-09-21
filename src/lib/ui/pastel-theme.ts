/** Accents icônes — saturés, lisibles sur verre clair */
export const PASTEL_ICON = {
  bag: "from-teal-400 to-emerald-500",
  outfit: "from-rose-400 to-orange-400",
  bus: "from-amber-400 to-orange-500",
  school: "from-sky-400 to-indigo-500",
  canteen: "from-emerald-400 to-teal-500",
  shopping: "from-orange-400 to-amber-500",
  house: "from-violet-400 to-indigo-500",
  calendar: "from-sky-400 to-blue-500",
} as const;

/** Lavis très légers sous le verre */
export const PASTEL_GRADIENTS = {
  bag: "from-teal-200/50 via-emerald-100/40 to-transparent",
  outfit: "from-rose-200/50 via-orange-100/40 to-transparent",
  bus: "from-amber-200/50 via-orange-100/40 to-transparent",
  school: "from-sky-200/50 via-indigo-100/35 to-transparent",
  canteen: "from-emerald-200/50 via-teal-100/40 to-transparent",
  shopping: "from-orange-200/50 via-amber-100/40 to-transparent",
  house: "from-violet-200/50 via-indigo-100/35 to-transparent",
  calendar: "from-sky-200/45 via-blue-100/35 to-transparent",
} as const;

export type PastelAccent = keyof typeof PASTEL_ICON;

export const SOFT_CTA = {
  bag: "border border-teal-300/50 bg-white/70 text-teal-900 shadow-md shadow-teal-200/20 active:bg-white",
  outfit:
    "border border-rose-300/50 bg-white/70 text-rose-900 shadow-md shadow-rose-200/20 active:bg-white",
  shopping:
    "border border-orange-300/50 bg-white/70 text-orange-950 shadow-md shadow-orange-200/20 active:bg-white",
  school:
    "border border-sky-300/50 bg-white/70 text-sky-950 shadow-md shadow-sky-200/20 active:bg-white",
  default:
    "border border-slate-200/70 bg-white/70 text-slate-800 shadow-md shadow-slate-200/25 active:bg-white",
} as const;

export const FILLED_CTA = {
  bag: "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-300/40 active:opacity-90",
  outfit:
    "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-md shadow-rose-300/40 active:opacity-90",
  shopping:
    "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md shadow-orange-300/40 active:opacity-90",
  school:
    "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-300/40 active:opacity-90",
} as const;

/**
 * Glass clair — lisibilité d’abord :
 * titres slate-900, labels slate-500, panneaux blancs translucides.
 */
export const GLASS = {
  panel:
    "rounded-3xl border border-white/60 border-t-white/80 border-l-white/70 bg-white/55 shadow-xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-300 ease-out",
  panelHover: "hover:border-white/80 hover:bg-white/70",
  pillActive:
    "rounded-full border border-slate-200/80 bg-white/90 text-slate-900 shadow-sm transition-all duration-300 ease-out",
  pillInactive:
    "rounded-full border border-slate-200/40 bg-transparent text-slate-500 transition-all duration-300 ease-out hover:border-slate-300/60 hover:bg-white/40 hover:text-slate-700",
  ink: "text-slate-900",
  muted: "text-slate-500",
  faint: "text-slate-400",
} as const;
