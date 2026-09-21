"use client";

import { HomeTopBar } from "./HomeTopBar";
import { HomeNextUpStrip } from "./HomeNextUpStrip";
import { HomeWeatherHud } from "./HomeWeatherHud";
import { HomeNightProvider, useIsNight } from "./HomeNightContext";
import { WeatherAmbientSky } from "./WeatherAmbientSky";
import { GLASS } from "@/lib/ui/pastel-theme";

/**
 * Home — panneaux glass clairs toujours lisibles sur le ciel ambiant.
 */
export function BentoDashboard() {
  const night = useIsNight();

  return (
    <HomeNightProvider night={night}>
      <div
        className="home-dashboard relative flex h-full min-h-0 flex-1 flex-col overflow-hidden"
        data-night={night ? "true" : "false"}
      >
        <WeatherAmbientSky />

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[72rem] flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-2 py-3 sm:gap-6 sm:px-3 sm:py-4 lg:gap-7 lg:overflow-hidden lg:px-4 lg:py-5">
          <div
            className={`home-panel home-bento-rise home-bento-rise-1 shrink-0 px-4 py-4 sm:px-5 ${GLASS.panel}`}
          >
            <HomeTopBar />
          </div>

          <div
            className={`home-panel home-bento-rise home-bento-rise-2 shrink-0 px-4 py-4 sm:px-5 ${GLASS.panel}`}
          >
            <HomeWeatherHud />
          </div>

          <div
            className={`home-panel home-bento-rise home-bento-rise-3 min-h-0 flex-1 px-4 py-4 sm:px-5 ${GLASS.panel}`}
          >
            <HomeNextUpStrip layout="soft" />
          </div>
        </div>
      </div>
    </HomeNightProvider>
  );
}
