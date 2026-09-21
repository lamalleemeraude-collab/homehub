"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, RefreshCw } from "lucide-react";
import { useHubRefresh } from "@/contexts/HubRefreshContext";

type HubRefreshButtonProps = {
  compact?: boolean;
};

export function HubRefreshButton({ compact = false }: HubRefreshButtonProps) {
  const { status, refreshAll } = useHubRefresh();
  const syncing = status === "syncing";
  const success = status === "success";

  return (
    <motion.button
      type="button"
      onClick={() => void refreshAll()}
      disabled={syncing}
      aria-label="Actualiser tout le hub"
      title="Actualiser agendas, météo et données"
      className={`hub-refresh-btn touch-target group relative overflow-hidden transition-opacity disabled:opacity-80 ${
        compact
          ? "flex h-11 w-11 items-center justify-center rounded-xl"
          : "flex w-full min-h-[2.75rem] items-center justify-center gap-2 rounded-2xl px-3 py-2.5"
      }`}
      whileTap={{ scale: syncing ? 1 : 0.96 }}
    >
      <span
        className={`hub-refresh-btn__glow pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-500 ${
          success ? "opacity-100" : syncing ? "opacity-90" : "opacity-0 group-hover:opacity-60"
        }`}
        aria-hidden
      />
      <span
        className={`hub-refresh-btn__ring pointer-events-none absolute inset-0 rounded-[inherit] ${
          syncing ? "hub-refresh-btn__ring--active" : ""
        }`}
        aria-hidden
      />

      <span
        className={`relative z-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500 text-white shadow-md shadow-sky-300/35 ${
          compact ? "h-9 w-9" : "h-8 w-8 shrink-0"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {success ? (
            <motion.span
              key="ok"
              initial={{ scale: 0.5, opacity: 0, rotate: -40 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="flex items-center justify-center"
            >
              <Check className="h-4 w-4" strokeWidth={3} />
            </motion.span>
          ) : (
            <motion.span
              key="spin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <RefreshCw
                className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                strokeWidth={2.5}
              />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {!compact && (
        <span className="relative z-10 min-w-0 flex-1 text-left">
          <span className="block text-xs font-medium text-slate-900">
            {success ? "À jour !" : syncing ? "Sync…" : "Actualiser"}
          </span>
          <span className="block truncate text-[10px] font-medium text-slate-500">
            {success ? "Tout est frais" : "Agendas & météo"}
          </span>
        </span>
      )}
    </motion.button>
  );
}
