"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, School } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS = [
  { href: "/ecole", label: "École", icon: School },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/", label: "Maison", icon: Home },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      aria-label="Navigation révisions"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-stretch gap-1 rounded-[1.75rem] border border-white/50 bg-white/55 px-2 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : href === "/ecole"
                ? pathname.startsWith("/ecole") ||
                  pathname.startsWith("/devoirs")
                : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className="relative flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-[11px] font-semibold tracking-wide transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="revisions-tab"
                  className="absolute inset-0 rounded-2xl bg-sky-500/12 ring-1 ring-inset ring-sky-300/40"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 ${
                  active ? "text-sky-700" : "text-slate-500"
                }`}
                strokeWidth={active ? 2.6 : 2.2}
              />
              <span
                className={`relative z-10 ${
                  active ? "text-sky-800" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
