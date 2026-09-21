"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { QuickApp } from "@/lib/quick-apps";
import { COLLEGE_APPS } from "@/lib/quick-apps";
import { nextBusSummary } from "@/lib/bus-schedule";
import { PASTEL_ICON } from "@/lib/ui/pastel-theme";

type QuickAccessNavProps = {
  compact?: boolean;
};

function CollegeNavLink({
  app,
  compact,
  active,
}: {
  app: QuickApp;
  compact: boolean;
  active: boolean;
}) {
  const Icon = app.icon;

  const className = compact
    ? `touch-target flex h-11 w-11 flex-col items-center justify-center rounded-xl transition-[color,background-color,box-shadow,transform] duration-150 active:scale-[0.95] ${
        active
          ? "bg-white/90 text-slate-800 shadow-sm ring-1 ring-slate-200/50"
          : "text-slate-500 active:bg-white/50"
      }`
    : `touch-target flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 transition-[color,background-color,box-shadow,transform] duration-150 active:scale-[0.97] ${
        active
          ? "bg-white/90 text-slate-800 shadow-sm shadow-slate-200/40 ring-1 ring-slate-200/50"
          : "text-slate-500 active:bg-white/50 active:text-slate-700"
      }`;

  const inner = (
    <>
      <span
        className={`flex items-center justify-center rounded-xl transition-colors duration-150 ${
          active || compact
            ? `bg-gradient-to-br ${PASTEL_ICON[app.accent]} ${compact ? "p-1.5" : "p-1.5"} text-white shadow-sm`
            : ""
        }`}
      >
        <Icon
          className={compact ? "h-4 w-4 text-white" : "h-6 w-6"}
          strokeWidth={active || compact ? 2.5 : 2}
        />
      </span>
      {!compact && (
        <span className="text-center text-xs font-bold leading-tight">
          {app.label}
        </span>
      )}
    </>
  );

  if (app.external) {
    return (
      <a
        href={app.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={app.sub ? `${app.label} · ${app.sub}` : app.label}
        aria-label={app.label}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={app.href}
      prefetch
      className={className}
      title={app.sub ? `${app.label} · ${app.sub}` : app.label}
      aria-label={app.label}
    >
      {inner}
    </Link>
  );
}

export function QuickAccessNav({ compact = false }: QuickAccessNavProps) {
  const pathname = usePathname();
  const busSummary = nextBusSummary();

  const isActive = (app: QuickApp) =>
    !app.external &&
    (app.href === "/" ? pathname === "/" : pathname.startsWith(app.href));

  return (
    <div
      className={
        compact
          ? "flex flex-col items-center gap-1.5 py-1"
          : "flex flex-col gap-1"
      }
    >
      {!compact && (
        <div className="mb-1 px-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Collège
          </p>
          {busSummary && (
            <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
              {busSummary}
            </p>
          )}
        </div>
      )}

      {COLLEGE_APPS.map((app) => (
        <CollegeNavLink
          key={app.id}
          app={app}
          compact={compact}
          active={isActive(app)}
        />
      ))}
    </div>
  );
}
