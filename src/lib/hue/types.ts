export type HueSceneId = "homework" | "dinner" | "sleep";

export type HueLightState = {
  on: boolean;
  bri?: number;
  ct?: number;
  transitiontime?: number;
};

export type HueSceneConfig = {
  id: HueSceneId;
  label: string;
  description: string;
  /** État appliqué au groupe Hue si pas de scène Hue nommée */
  fallbackState: HueLightState;
  /** Variable d'env optionnelle pour une scène enregistrée dans l'app Hue */
  envSceneVar: string;
};

export type HueActivateResult = {
  ok: boolean;
  mode: "hue-scene" | "light-state" | "mock";
  message: string;
  sceneId: HueSceneId;
};

export type HueStatus = {
  connected: boolean;
  configured: boolean;
  bridgeIp: string | null;
  groupId: number;
};
