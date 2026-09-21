"use client";

import { useEffect, useState } from "react";
import type { CalendarSyncStatus } from "@/hooks/useCalendarEvents";

type CalendarSyncIndicatorProps = {
  status: CalendarSyncStatus;
  lastSyncedAt: Date | null;
};

function statusMeta(status: CalendarSyncStatus): {
  dot: string;
  title: string;
  pulse: boolean;
} {
  switch (status) {
    case "syncing":
      return {
        dot: "bg-amber-400",
        title: "Synchronisation en cours…",
        pulse: true,
      };
    case "live":
      return {
        dot: "bg-emerald-500",
        title: "Agendas synchronisés",
        pulse: false,
      };
    case "error":
      return {
        dot: "bg-rose-400",
        title: "Synchronisation indisponible",
        pulse: false,
      };
    default:
      return {
        dot: "bg-slate-300",
        title: "Connexion aux agendas…",
        pulse: true,
      };
  }
}

function formatSyncTime(date: Date): string {
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 15) return "À l'instant";
  if (diffSec < 60) return `Il y a ${diffSec} s`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Il y a ${diffMin} min`;

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CalendarSyncIndicator({
  status,
  lastSyncedAt,
}: CalendarSyncIndicatorProps) {
  const [, setTick] = useState(0);
  const meta = statusMeta(status);

  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex h-9 w-9 items-center justify-center sm:h-10 sm:w-10"
      title={
        lastSyncedAt
          ? `${meta.title} — ${formatSyncTime(lastSyncedAt)}`
          : meta.title
      }
      aria-label={meta.title}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full shadow-sm ${meta.dot} ${
          meta.pulse ? "animate-pulse" : ""
        }`}
      />
    </div>
  );
}
