/** Événement dispatché pour les hooks hors contexte (météo locale, etc.) */
export const HUB_REFRESH_EVENT = "homehub-refresh";

export function dispatchHubRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HUB_REFRESH_EVENT));
}
