"use client";

import { useCallback, useEffect, useState } from "react";
import type { HueSceneId } from "@/lib/hue/types";

type ActivateResult = {
  ok: boolean;
  mode: string;
  message: string;
};

export function useHue() {
  const [hueConfigured, setHueConfigured] = useState(false);
  const [hueConnected, setHueConnected] = useState(false);
  const [loadingScene, setLoadingScene] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hue/status")
      .then((r) => r.json())
      .then((data) => {
        setHueConfigured(data.configured);
        setHueConnected(data.connected);
      })
      .catch(() => {
        setHueConfigured(false);
        setHueConnected(false);
      });
  }, []);

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const activateScene = useCallback(
    async (sceneId: HueSceneId | string): Promise<boolean> => {
      setLoadingScene(sceneId);
      try {
        const res = await fetch(`/api/hue/scene/${sceneId}`, { method: "POST" });
        const data: ActivateResult = await res.json();
        showFeedback(data.message);
        return data.ok;
      } catch {
        showFeedback("Impossible de joindre le pont Hue");
        return false;
      } finally {
        setLoadingScene(null);
      }
    },
    [showFeedback]
  );

  const cycleLights = useCallback(
    async (current: "off" | "warm" | "cool") => {
      try {
        const res = await fetch("/api/hue/lights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current }),
        });
        const data = await res.json();
        if (data.message) showFeedback(data.message);
        return data as { ok: boolean; next: "off" | "warm" | "cool" };
      } catch {
        showFeedback("Erreur lumières Hue");
        return { ok: false, next: current as "off" | "warm" | "cool" };
      }
    },
    [showFeedback]
  );

  return {
    hueConfigured,
    hueConnected,
    loadingScene,
    feedback,
    activateScene,
    cycleLights,
  };
}
