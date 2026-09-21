"use client";

import { Lightbulb } from "lucide-react";
import { BentoCard } from "@/components/ui/BentoCard";
import { TouchButton } from "@/components/ui/TouchButton";
import { GLASS } from "@/lib/ui/pastel-theme";

type LightsState = "off" | "warm" | "cool";

type HueLightsControlProps = {
  state: LightsState;
  onCycle: () => void;
  hueConfigured: boolean;
  hueConnected: boolean;
};

function statusLabel(state: LightsState): string {
  switch (state) {
    case "off":
      return "Éteint";
    case "warm":
      return "Allumé — Blanc chaud";
    case "cool":
      return "Allumé — Blanc froid";
  }
}

export function HueLightsControl({
  state,
  onCycle,
  hueConfigured,
  hueConnected,
}: HueLightsControlProps) {
  const isOn = state !== "off";
  const brightness = state === "off" ? 0 : state === "warm" ? 65 : 90;

  return (
    <BentoCard className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ${
              isOn
                ? "from-amber-400 to-orange-500 shadow-amber-200/50"
                : "from-slate-200 to-slate-300 shadow-slate-200/40"
            }`}
          >
            <Lightbulb className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-lg font-medium text-slate-900 sm:text-xl">
              Salon — Philips Hue
            </p>
            <p
              className={`text-sm font-medium ${
                isOn ? "text-emerald-600" : "text-slate-500"
              }`}
            >
              {statusLabel(state)}
              {hueConfigured && (
                <span className="text-slate-400">
                  {" "}
                  · {hueConnected ? "Pont connecté" : "Hors ligne"}
                </span>
              )}
            </p>
          </div>
        </div>

        <TouchButton
          ariaLabel="Changer l'éclairage du salon"
          onClick={onCycle}
          className={`touch-target shrink-0 px-6 py-3 text-base font-medium active:scale-[0.98] ${
            isOn ? GLASS.pillActive : GLASS.pillInactive
          }`}
        >
          {isOn ? "Changer" : "Allumer"}
        </TouchButton>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">Luminosité</span>
          <span className="tabular-nums text-slate-600">{brightness}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={brightness}
          readOnly
          onClick={onCycle}
          aria-label="Luminosité (appuyer pour changer)"
          className="glass-slider cursor-pointer"
        />
        <div className="pt-1">
          <p className="mb-1.5 text-xs font-medium text-slate-500">Ambiance</p>
          <div
            className="glass-slider glass-slider--spectrum pointer-events-none h-3 opacity-95"
            aria-hidden
          />
        </div>
      </div>
    </BentoCard>
  );
}
