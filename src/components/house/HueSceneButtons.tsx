"use client";

import { TouchButton } from "@/components/ui/TouchButton";
import { useHue } from "@/hooks/useHue";
import { mockDomoticScenes } from "@/lib/mock-data";
import { PASTEL_GRADIENTS } from "@/lib/ui/pastel-theme";

const SCENE_GRADIENT: Record<string, string> = {
  homework: PASTEL_GRADIENTS.school,
  dinner: PASTEL_GRADIENTS.bus,
  sleep: PASTEL_GRADIENTS.house,
};

type HueSceneButtonsProps = {
  activeScene: string | null;
  onSceneActivated: (sceneId: string) => void;
  layout?: "grid" | "row";
  activateScene?: (sceneId: string) => Promise<boolean>;
  loadingScene?: string | null;
  hueConnected?: boolean;
  hueConfigured?: boolean;
};

export function HueSceneButtons({
  activeScene,
  onSceneActivated,
  layout = "grid",
  activateScene: externalActivate,
  loadingScene: externalLoading,
  hueConnected: externalConnected,
  hueConfigured: externalConfigured,
}: HueSceneButtonsProps) {
  const internal = useHue();
  const activateScene = externalActivate ?? internal.activateScene;
  const loadingScene = externalLoading ?? internal.loadingScene;
  const hueConnected = externalConnected ?? internal.hueConnected;
  const hueConfigured = externalConfigured ?? internal.hueConfigured;

  async function handleScene(sceneId: string) {
    const ok = await activateScene(sceneId);
    if (ok) onSceneActivated(sceneId);
  }

  return (
    <div>
      <div
        className={
          layout === "grid" ? "grid grid-cols-3 gap-3" : "flex justify-around gap-3"
        }
      >
        {mockDomoticScenes.map((scene) => {
          const isActive = activeScene === scene.id;
          const isLoading = loadingScene === scene.id;
          const gradient = SCENE_GRADIENT[scene.id] ?? PASTEL_GRADIENTS.house;

          return (
            <TouchButton
              key={scene.id}
              ariaLabel={scene.label}
              onClick={() => handleScene(scene.id)}
              className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border p-4 shadow-md transition-all duration-300 ease-out active:scale-[0.98] sm:p-5 ${
                isActive
                  ? "border-violet-300/70 bg-white/85 shadow-violet-200/40"
                  : "border-white/70 bg-white/55 backdrop-blur-xl hover:border-white/90 hover:bg-white/75"
              } ${isLoading ? "opacity-70" : ""}`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`}
                aria-hidden
              />
              <span className="relative z-10 text-lg font-medium text-slate-900 sm:text-xl">
                {isLoading ? "…" : scene.label.split(" ").pop()}
              </span>
              <span className="relative z-10 text-center text-xs font-medium text-slate-500">
                {scene.label}
              </span>
            </TouchButton>
          );
        })}
      </div>
      {hueConfigured && (
        <p className="mt-3 text-center text-xs font-medium text-slate-500">
          {hueConnected
            ? "Pont Hue connecté"
            : "Pont Hue hors ligne — mode simulation"}
        </p>
      )}
    </div>
  );
}
