"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Home,
  Lightbulb,
  School,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { HubRefreshButton } from "@/components/layout/HubRefreshButton";
import { COLLEGE_APPS, type QuickApp } from "@/lib/quick-apps";
import { nextBusSummary } from "@/lib/bus-schedule";
import { PASTEL_ICON } from "@/lib/ui/pastel-theme";

const SIDEBAR_KEY = "homehub-sidebar-collapsed";

export const navItems = [
  { href: "/", label: "Accueil", shortLabel: "Accueil", icon: Home, accent: "calendar" as const },
  {
    href: "/calendar",
    label: "Calendrier",
    shortLabel: "Calendrier",
    icon: CalendarDays,
    accent: "calendar" as const,
  },
  {
    href: "/emploi-du-temps",
    label: "EDT",
    shortLabel: "EDT",
    icon: GraduationCap,
    accent: "school" as const,
  },
  {
    href: "/repas",
    label: "Repas",
    shortLabel: "Repas",
    icon: ChefHat,
    accent: "canteen" as const,
  },
  {
    href: "/shopping",
    label: "Courses",
    shortLabel: "Courses",
    icon: ShoppingCart,
    accent: "shopping" as const,
  },
  {
    href: "/house",
    label: "Maison",
    shortLabel: "Maison",
    icon: Lightbulb,
    accent: "house" as const,
  },
] as const;

const COLLEGE_PATHS = ["/docs-utiles", "/routine/sac", "/routine"];

function NavLink({
  href,
  label,
  icon: Icon,
  accent,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: keyof typeof PASTEL_ICON;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      title={label}
      aria-label={label}
      className={`touch-target flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 ease-out active:scale-[0.97] ${
        collapsed ? "mx-auto h-12 w-12" : "min-h-[3.5rem] w-full px-2 py-2"
      } ${
        active
          ? "border border-white/80 bg-white/85 text-slate-900 shadow-md shadow-slate-900/8"
          : "border border-transparent text-slate-500 hover:border-white/50 hover:bg-white/45 hover:text-slate-800"
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-xl transition-colors duration-300 ${
          active
            ? `bg-gradient-to-br ${PASTEL_ICON[accent]} p-1.5 text-white shadow-sm`
            : ""
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
      </span>
      {!collapsed && (
        <span className="text-center text-[11px] font-medium leading-tight">
          {label}
        </span>
      )}
    </Link>
  );
}

function CollegeSubLink({
  app,
  active,
  collapsed,
}: {
  app: QuickApp;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = app.icon;
  const className = `touch-target flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ease-out active:scale-[0.97] ${
    collapsed ? "h-11 w-11" : "min-h-[3.25rem] w-full px-1 py-1.5"
  } ${
    active
      ? "border border-white/80 bg-white/90 text-slate-900 shadow-sm"
      : "border border-transparent text-slate-500 hover:bg-white/50 hover:text-slate-800"
  }`;

  const inner = (
    <>
      <span
        className={`flex items-center justify-center rounded-xl ${
          active
            ? `bg-gradient-to-br ${PASTEL_ICON[app.accent]} p-1.5 text-white shadow-sm`
            : ""
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
      </span>
      {!collapsed && (
        <span className="text-center text-[11px] font-medium leading-tight">
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

function CollegeMenu({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const busSummary = nextBusSummary();
  const collegeActive =
    COLLEGE_PATHS.some((p) => pathname.startsWith(p)) ||
    COLLEGE_APPS.some((a) => !a.external && pathname.startsWith(a.href));

  const [open, setOpen] = useState(collegeActive);

  useEffect(() => {
    if (collegeActive) setOpen(true);
  }, [collegeActive]);

  return (
    <div className={`flex flex-col ${collapsed ? "items-center" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Collège"
        aria-label="Collège"
        aria-expanded={open}
        className={`touch-target flex flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 ease-out active:scale-[0.97] ${
          collapsed ? "h-12 w-12" : "min-h-[3.5rem] w-full px-2 py-2"
        } ${
          collegeActive || open
            ? "border border-white/70 bg-white/70 text-slate-900"
            : "border border-transparent text-slate-500 hover:bg-white/45"
        }`}
      >
        <span
          className={`flex items-center justify-center rounded-xl ${
            collegeActive
              ? `bg-gradient-to-br ${PASTEL_ICON.school} p-1.5 text-white shadow-sm`
              : ""
          }`}
        >
          <School className="h-5 w-5" strokeWidth={collegeActive ? 2.5 : 2} />
        </span>
        {!collapsed && (
          <span className="flex items-center gap-0.5 text-[11px] font-medium leading-tight">
            Collège
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              strokeWidth={2.5}
            />
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: "auto" }}
            exit={{ opacity: 0, scale: 0.95, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`mt-1 overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-1 backdrop-blur-xl ${
              collapsed ? "flex flex-col items-center" : ""
            }`}
          >
            {!collapsed && busSummary && (
              <p className="mb-0.5 truncate px-1.5 pt-1 text-center text-[9px] font-medium text-slate-400">
                {busSummary}
              </p>
            )}
            {COLLEGE_APPS.map((app) => (
              <CollegeSubLink
                key={app.id}
                app={app}
                collapsed={collapsed}
                active={
                  !app.external &&
                  (app.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(app.href))
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function useActivePath() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored === "1") setCollapsed(true);
      else if (stored === "0") setCollapsed(false);
      else {
        setCollapsed(window.matchMedia("(max-width: 1023px)").matches);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return { collapsed: ready ? collapsed : false, toggle, ready };
}

export function SidebarNav() {
  const isActive = useActivePath();
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <aside
      className={`relative z-50 flex shrink-0 flex-col border-r border-white/50 bg-white/45 py-3 shadow-xl shadow-slate-900/5 backdrop-blur-2xl transition-[width] duration-300 ease-out ${
        collapsed ? "w-[3.75rem] px-1.5" : "w-[var(--kiosk-sidebar-w)] px-2"
      }`}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div
        className={`mb-2 flex items-center ${
          collapsed ? "flex-col gap-2" : "justify-between gap-1 px-1"
        }`}
      >
        {!collapsed && (
          <div className="min-w-0 px-1">
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Hub
            </p>
            <p className="truncate text-base font-medium text-slate-900">
              Familial
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className="touch-target flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-400 transition-all duration-300 hover:border-white/60 hover:bg-white/60 hover:text-slate-700"
          aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
          title={collapsed ? "Agrandir le menu" : "Réduire le menu"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          ) : (
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          )}
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain">
        {navItems.slice(0, 2).map(({ href, label, icon, accent }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            accent={accent}
            active={isActive(href)}
            collapsed={collapsed}
          />
        ))}

        <CollegeMenu collapsed={collapsed} />

        {navItems.slice(2).map(({ href, label, icon, accent }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            accent={accent}
            active={isActive(href)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <HubRefreshButton compact={collapsed} />
      </div>
    </aside>
  );
}

export function BottomNav() {
  return null;
}
