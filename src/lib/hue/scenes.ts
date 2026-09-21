import type { HueSceneConfig } from "./types";

export const HUE_SCENES: HueSceneConfig[] = [
  {
    id: "homework",
    label: "Mode Devoirs",
    description: "Blanc froid — concentration",
    fallbackState: {
      on: true,
      bri: 254,
      ct: 200,
      transitiontime: 10,
    },
    envSceneVar: "HUE_SCENE_HOMEWORK",
  },
  {
    id: "dinner",
    label: "Dîner",
    description: "Blanc chaud tamisé — convivialité",
    fallbackState: {
      on: true,
      bri: 180,
      ct: 420,
      transitiontime: 20,
    },
    envSceneVar: "HUE_SCENE_DINNER",
  },
  {
    id: "sleep",
    label: "Dodo",
    description: "Extinction progressive",
    fallbackState: {
      on: false,
      transitiontime: 30,
    },
    envSceneVar: "HUE_SCENE_SLEEP",
  },
];

export function getHueSceneConfig(id: string): HueSceneConfig | undefined {
  return HUE_SCENES.find((s) => s.id === id);
}
