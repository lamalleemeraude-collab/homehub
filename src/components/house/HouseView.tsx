"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { HubPageHeader } from "@/components/ui/HubPageHeader";
import { HueLightsControl } from "@/components/house/HueLightsControl";
import { HueSceneButtons } from "@/components/house/HueSceneButtons";
import { MusicStudioPanel } from "@/components/house/MusicStudioPanel";
import { useHue } from "@/hooks/useHue";
import { mockDomoticScenes } from "@/lib/mock-data";
import { PASTEL_GRADIENTS } from "@/lib/ui/pastel-theme";

type LightsState = "off" | "warm" | "cool";

function sceneLights(sceneId: string, prev: LightsState): LightsState {
  switch (sceneId) {
    case "homework":
      return "cool";
    case "dinner":
      return "warm";
    case "sleep":
      return "off";
    default:
      return prev;
  }
}

export function HouseView() {
  const {
    feedback,
    cycleLights,
    hueConfigured,
    hueConnected,
    activateScene,
    loadingScene,
  } = useHue();
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [lights, setLights] = useState<LightsState>("warm");
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const statusMessage =
    feedback ??
    localMessage ??
    (hueConfigured
      ? hueConnected
        ? "Philips Hue prêt"
        : "Hue hors ligne — vérifie le pont"
      : null);

  function showLocal(message: string) {
    setLocalMessage(message);
    setTimeout(() => setLocalMessage(null), 2000);
  }

  async function handleCycleLights() {
    const result = await cycleLights(lights);
    if (result.ok) {
      setLights(result.next);
      showLocal(`Salon : ${result.next === "off" ? "éteint" : "allumé"}`);
    }
  }

  function onSceneActivated(sceneId: string) {
    setActiveScene(sceneId);
    setLights((prev) => sceneLights(sceneId, prev));
    const scene = mockDomoticScenes.find((s) => s.id === sceneId);
    if (scene) showLocal(`Scène « ${scene.label} » activée`);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <HubPageHeader
        accent="house"
        icon={Lightbulb}
        eyebrow="Domotique"
        title="Maison"
        subtitle={
          statusMessage
            ? `Lumières Hue & studio musique — ${statusMessage}`
            : "Lumières Hue & studio musique"
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-3 sm:gap-4">
          <BentoCard
            variant="gradient"
            gradient={PASTEL_GRADIENTS.house}
            className="shrink-0 p-5 sm:p-6"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Scènes Hue
            </p>
            <p className="mb-5 text-xl font-medium text-slate-900 sm:text-2xl">
              Raccourcis rapides
            </p>

            <HueSceneButtons
              activeScene={activeScene}
              onSceneActivated={onSceneActivated}
              activateScene={activateScene}
              loadingScene={loadingScene}
              hueConnected={hueConnected}
              hueConfigured={hueConfigured}
            />
          </BentoCard>

          <HueLightsControl
            state={lights}
            onCycle={handleCycleLights}
            hueConfigured={hueConfigured}
            hueConnected={hueConnected}
          />
        </div>

        <div className="min-h-[320px] lg:min-h-0">
          <MusicStudioPanel />
        </div>
      </div>
    </div>
  );
}
