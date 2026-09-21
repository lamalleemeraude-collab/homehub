import { type ReactNode } from "react";
import { GLASS } from "@/lib/ui/pastel-theme";

type BentoCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "postit" | "gradient";
  gradient?: string;
};

export function BentoCard({
  children,
  className = "",
  variant = "default",
  gradient,
}: BentoCardProps) {
  const base = `relative overflow-hidden ${GLASS.panel}`;

  if (variant === "postit") {
    return (
      <div
        className={`${base} border-amber-200/60 bg-amber-50/70 ${className}`}
      >
        {children}
      </div>
    );
  }

  if (variant === "gradient" && gradient) {
    return (
      <div className={`${base} bento-gradient-card ${GLASS.panelHover} ${className}`}>
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/40 via-white/10 to-white/30"
          aria-hidden
        />
        <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className={`${base} glass-card ${GLASS.panelHover} ${className}`}>
      {children}
    </div>
  );
}
