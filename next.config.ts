import type { NextConfig } from "next";

/**
 * En prod sous https://francoislamalle.fr/hub :
 *   npm run build:hub && npm run start:hub
 * En local : laisser BASE_PATH vide (http://localhost:3000).
 */
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // standalone = VPS/OVH ; sur Vercel on laisse le builder natif
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
