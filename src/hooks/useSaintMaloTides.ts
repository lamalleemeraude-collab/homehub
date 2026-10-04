"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HUB_REFRESH_EVENT } from "@/lib/hub-refresh";
import { buildSchedule } from "@/lib/tides/engine";
import { SAINT_MALO_FALLBACK_SCHEDULE } from "@/lib/tides/saint-malo-fallback";
import type { TideEvent, TideSnapshot } from "@/lib/tides/types";

type State = {
  events: TideEvent[];
  port: string;
  source: string;
  sourceUrl: string;
  syncedAt: string | null;
  loading: boolean;
  error: string | null;
};

const FALLBACK = buildSchedule(SAINT_MALO_FALLBACK_SCHEDULE);

export function useSaintMaloTides() {
  const [state, setState] = useState<State>({
    events: FALLBACK,
    port: "Saint-Malo",
    source: "fallback",
    sourceUrl: "https://maree.info/52",
    syncedAt: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tides/saint-malo", { cache: "no-store" });
      const data = (await res.json()) as TideSnapshot & { error?: string };
      if (!data.ok || !data.events?.length) {
        throw new Error(data.error || "Marées indisponibles");
      }
      setState({
        events: buildSchedule(data.events),
        port: data.port,
        source: data.source,
        sourceUrl: data.sourceUrl,
        syncedAt: data.syncedAt,
        loading: false,
        error: null,
      });
    } catch (e) {
      setState((prev) => ({
        ...prev,
        events: prev.events.length ? prev.events : FALLBACK,
        loading: false,
        error: e instanceof Error ? e.message : "Erreur marées",
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onHub = () => void refresh();
    window.addEventListener(HUB_REFRESH_EVENT, onHub);
    return () => window.removeEventListener(HUB_REFRESH_EVENT, onHub);
  }, [refresh]);

  const schedule = useMemo(() => state.events, [state.events]);

  return { ...state, schedule, refresh };
}
