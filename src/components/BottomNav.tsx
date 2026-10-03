"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, School } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS = [
  { href: "/ecole", label: "École", icon: School },
  { href: "/flashcards", label: "Cartes", icon: Layers },
  { href: "/", label: "Maison", icon: Home },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigation école">
      <div className="mobile-bottom-nav__bar">
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
              className="mobile-bottom-nav__item"
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="revisions-tab"
                  className="absolute inset-0 rounded-[1.1rem] bg-sky-500/14 ring-1 ring-inset ring-sky-300/45"
                  transition={{ type: "spring", stiffness: 460, damping: 36 }}
                />
              )}
              <Icon
                className={`relative z-10 h-[1.35rem] w-[1.35rem] ${
                  active ? "text-sky-700" : "text-slate-500"
                }`}
                strokeWidth={active ? 2.6 : 2.15}
              />
              <span
                className={`relative z-10 truncate px-0.5 ${
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
