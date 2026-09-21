import { getHueSceneConfig } from "./scenes";
import type { HueActivateResult, HueLightState, HueSceneId, HueStatus } from "./types";

function getBridgeIp(): string | undefined {
  return process.env.HUE_BRIDGE_IP?.trim() || undefined;
}

function getUsername(): string | undefined {
  return process.env.HUE_USERNAME?.trim() || undefined;
}

function getGroupId(): number {
  const raw = process.env.HUE_GROUP_ID?.trim();
  if (!raw) return 0;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isConfigured(): boolean {
  return Boolean(getBridgeIp() && getUsername());
}

async function hueRequest<T>(
  path: string,
  method: "GET" | "PUT" = "GET",
  body?: unknown
): Promise<T> {
  const bridgeIp = getBridgeIp();
  const username = getUsername();
  if (!bridgeIp || !username) {
    throw new Error("Hue non configuré");
  }

  const url = `http://${bridgeIp}/api/${username}${path}`;
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Hue API error: ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data) && data[0]?.error) {
    throw new Error(data[0].error.description ?? "Erreur Hue");
  }

  return data as T;
}

export function getHueStatus(): HueStatus {
  const bridgeIp = getBridgeIp() ?? null;
  return {
    connected: false,
    configured: isConfigured(),
    bridgeIp,
    groupId: getGroupId(),
  };
}

export async function checkHueConnection(): Promise<HueStatus> {
  const status = getHueStatus();
  if (!status.configured) return status;

  try {
    await hueRequest("/config");
    return { ...status, connected: true };
  } catch {
    return { ...status, connected: false };
  }
}

export async function activateHueScene(
  sceneId: HueSceneId
): Promise<HueActivateResult> {
  const config = getHueSceneConfig(sceneId);
  if (!config) {
    return {
      ok: false,
      mode: "mock",
      message: "Scène inconnue",
      sceneId,
    };
  }

  if (!isConfigured()) {
    return {
      ok: true,
      mode: "mock",
      message: `${config.label} (simulation — configure HUE_BRIDGE_IP)`,
      sceneId,
    };
  }

  const groupId = getGroupId();
  const envSceneId = process.env[config.envSceneVar]?.trim();

  try {
    if (envSceneId) {
      await hueRequest(`/groups/${groupId}/action`, "PUT", {
        scene: envSceneId,
      });
      return {
        ok: true,
        mode: "hue-scene",
        message: `${config.label} — scène Hue activée`,
        sceneId,
      };
    }

    await hueRequest(`/groups/${groupId}/action`, "PUT", config.fallbackState);
    return {
      ok: true,
      mode: "light-state",
      message: `${config.label} — lumières mises à jour`,
      sceneId,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur inconnue";
    return {
      ok: false,
      mode: "light-state",
      message: `Hue : ${msg}`,
      sceneId,
    };
  }
}

export async function setHueLightState(
  state: HueLightState
): Promise<{ ok: boolean; message: string }> {
  if (!isConfigured()) {
    return { ok: true, message: "Simulation lumières" };
  }

  try {
    await hueRequest(`/groups/${getGroupId()}/action`, "PUT", state);
    return { ok: true, message: "Lumières mises à jour" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erreur Hue";
    return { ok: false, message: msg };
  }
}

export async function cycleHueLights(
  current: "off" | "warm" | "cool"
): Promise<{ ok: boolean; next: "off" | "warm" | "cool"; message: string }> {
  const states: Record<"off" | "warm" | "cool", HueLightState> = {
    off: { on: false, transitiontime: 10 },
    warm: { on: true, bri: 200, ct: 420, transitiontime: 10 },
    cool: { on: true, bri: 254, ct: 200, transitiontime: 10 },
  };

  const order: Array<"off" | "warm" | "cool"> = ["off", "warm", "cool"];
  const nextIndex = (order.indexOf(current) + 1) % order.length;
  const next = order[nextIndex];

  const result = await setHueLightState(states[next]);
  return { ...result, next };
}
