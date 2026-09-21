import type { LucideIcon } from "lucide-react";
import { PASTEL_ICON, type PastelAccent } from "@/lib/ui/pastel-theme";

type HubPageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  accent?: PastelAccent;
  actions?: React.ReactNode;
};

export function HubPageHeader({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  accent = "school",
  actions,
}: HubPageHeaderProps) {
  return (
    <header className="mb-1 flex shrink-0 flex-col gap-4 sm:mb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
      <div className="flex min-w-0 items-center gap-3.5">
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${PASTEL_ICON[accent]} shadow-md shadow-slate-300/40 sm:h-12 sm:w-12`}
          >
            <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-medium text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm font-medium text-slate-500 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
