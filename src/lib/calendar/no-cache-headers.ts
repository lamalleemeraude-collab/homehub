/** En-têtes anti-cache pour les routes calendrier (Next.js + proxies). */
export const CALENDAR_NO_CACHE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};
