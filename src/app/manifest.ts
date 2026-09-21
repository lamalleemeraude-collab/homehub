import type { MetadataRoute } from "next";

/**
 * Manifest PWA — Next.js préfixe automatiquement basePath
 * (en prod : start_url devient /hub/).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hub Familial",
    short_name: "Hub",
    description: "Tableau de bord familial pour tablette",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f1f5f9",
    theme_color: "#f1f5f9",
    lang: "fr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
