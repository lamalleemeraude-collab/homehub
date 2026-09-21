"use client";

import { RefreshCw } from "lucide-react";
import { TouchButton } from "@/components/ui/TouchButton";
import type { CalendarSyncStatus } from "@/hooks/useCalendarEvents";

type CalendarRefreshButtonProps = {
  onRefresh: () => void;
  status: CalendarSyncStatus;
  className?: string;
};

export function CalendarRefreshButton({
  onRefresh,
  status,
  className = "",
}: CalendarRefreshButtonProps) {
  const syncing = status === "syncing";

  return (
    <TouchButton
      ariaLabel="Rafraîchir les agendas"
      onClick={onRefresh}
      disabled={syncing}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/60 bg-white/80 text-slate-400 active:bg-slate-50 disabled:opacity-60 sm:h-10 sm:w-10 ${className}`}
    >
      <RefreshCw
        className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${syncing ? "animate-spin text-blue-500" : ""}`}
        strokeWidth={2.5}
      />
    </TouchButton>
  );
}
