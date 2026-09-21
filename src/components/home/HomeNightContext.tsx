"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const HomeNightContext = createContext(false);

export function useHomeNight() {
  return useContext(HomeNightContext);
}

export function useIsNight() {
  const [night, setNight] = useState(false);

  useEffect(() => {
    const tick = () => {
      const h = new Date().getHours();
      setNight(h < 7 || h >= 20);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return night;
}

export function HomeNightProvider({
  night,
  children,
}: {
  night: boolean;
  children: ReactNode;
}) {
  return (
    <HomeNightContext.Provider value={night}>{children}</HomeNightContext.Provider>
  );
}

/**
 * Typo glass clair — toujours sombre pour lisibilité maximale,
 * même si le ciel ambiant est nocturne.
 */
export function homeTone(_night?: boolean) {
  return {
    ink: "text-slate-900",
    soft: "text-slate-700",
    muted: "text-slate-500",
    faint: "text-slate-400",
    accent: "text-teal-700",
    link: "text-sky-600",
    today: "text-violet-700",
    tomorrow: "text-sky-700",
  } as const;
}
