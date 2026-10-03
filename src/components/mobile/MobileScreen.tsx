import type { ReactNode } from "react";

/**
 * Conteneur d’écran app (iPhone-first).
 * Safe areas + largeur courte par défaut ; s’élargit un peu sur grands téléphones.
 */
export function MobileScreen({
  children,
  className = "",
  tight = false,
}: {
  children: ReactNode;
  className?: string;
  /** Moins de padding vertical (listes denses). */
  tight?: boolean;
}) {
  return (
    <div
      className={[
        "mobile-screen mx-auto w-full max-w-[26.5rem]",
        tight ? "mobile-screen--tight" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
