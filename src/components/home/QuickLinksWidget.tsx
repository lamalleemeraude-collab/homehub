import Link from "next/link";
import { ArrowUpRight, Bus, GraduationCap, UtensilsCrossed } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { nextBusSummary } from "@/lib/bus-schedule";
import { PASTEL_GRADIENTS, PASTEL_ICON } from "@/lib/ui/pastel-theme";

const EXTERNAL_LINKS = [
  {
    id: "ecoledirecte",
    label: "EcoleDirecte",
    description: "Notes, messagerie & absences",
    href: "https://www.ecoledirecte.com/login?cameFrom=%2F1%2F3092%2FMessagerie",
    icon: GraduationCap,
    iconGradient: PASTEL_ICON.school,
    chip: PASTEL_GRADIENTS.school,
    ring: "active:ring-sky-200/60",
  },
  {
    id: "clicetmiam",
    label: "Clic et Miam",
    description: "Menus cantine Convivio",
    href: "https://www.clicetmiam.fr/connexion",
    icon: UtensilsCrossed,
    iconGradient: PASTEL_ICON.canteen,
    chip: PASTEL_GRADIENTS.canteen,
    ring: "active:ring-emerald-200/60",
  },
] as const;

export function QuickLinksWidget() {
  const busSummary = nextBusSummary() ?? "Ligne DI10 · Maelle";

  return (
    <BentoCard className="flex h-full flex-col p-4 sm:p-5 md:p-6">
      <div className="mb-3 sm:mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-sm">
          Accès rapides
        </p>
        <p className="mt-0.5 text-xl font-bold text-slate-800 sm:text-2xl">
          Docs utiles
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-2.5 sm:gap-3">
        <Link
          href="/docs-utiles"
          prefetch
          className={`touch-target group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-white/50 bg-gradient-to-r ${PASTEL_GRADIENTS.bus} px-3 py-3 shadow-sm shadow-amber-100/30 transition-transform active:scale-[0.98] sm:gap-4 sm:px-4 sm:py-3.5`}
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${PASTEL_ICON.bus} shadow-md shadow-amber-200/30 sm:h-12 sm:w-12`}
          >
            <Bus className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-slate-800 sm:text-lg">
              Horaires bus
            </p>
            <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
              {busSummary}
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm transition-colors group-active:bg-white sm:h-10 sm:w-10">
            <ArrowUpRight
              className="h-4 w-4 text-slate-400 group-active:text-slate-600 sm:h-5 sm:w-5"
              strokeWidth={2.5}
            />
          </div>
        </Link>

        {EXTERNAL_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`touch-target group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-white/50 bg-gradient-to-r ${link.chip} px-3 py-3 shadow-sm shadow-slate-200/20 transition-transform active:scale-[0.98] sm:gap-4 sm:px-4 sm:py-3.5 ${link.ring}`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${link.iconGradient} shadow-md shadow-slate-200/25 sm:h-12 sm:w-12`}
              >
                <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-slate-800 sm:text-lg">
                  {link.label}
                </p>
                <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                  {link.description}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm transition-colors group-active:bg-white sm:h-10 sm:w-10">
                <ArrowUpRight
                  className="h-4 w-4 text-slate-400 group-active:text-slate-600 sm:h-5 sm:w-5"
                  strokeWidth={2.5}
                />
              </div>
            </a>
          );
        })}
      </div>
    </BentoCard>
  );
}
