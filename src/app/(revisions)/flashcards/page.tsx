import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MobileScreen } from "@/components/mobile/MobileScreen";
import { GLASS } from "@/lib/ui/pastel-theme";

export default function FlashcardsPage() {
  return (
    <MobileScreen>
      <header className={`px-3.5 py-3.5 ${GLASS.panel}`}>
        <Link
          href="/ecole"
          className="app-btn inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-violet-600/85"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          École
        </Link>
        <h1 className="app-title mt-0.5 text-slate-900">Flashcards</h1>
        <p className="app-sub mt-0.5">
          Cartes de révision — bientôt, après validation ÉcoleDirecte.
        </p>
      </header>
      <div className={`mt-3 px-3.5 py-4 ${GLASS.panel}`}>
        <p className="text-sm font-semibold leading-relaxed text-slate-600">
          En attendant : ouvre Focus pour un créneau de 15 min, ou Devoirs pour
          préparer ta prochaine éval.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            href="/ecole/focus"
            className="app-btn flex items-center justify-center rounded-xl bg-violet-600 px-4 text-sm font-bold text-white"
          >
            Lancer un focus
          </Link>
          <Link
            href="/devoirs"
            className="app-btn flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-bold text-slate-800"
          >
            Voir les devoirs
          </Link>
        </div>
      </div>
    </MobileScreen>
  );
}
