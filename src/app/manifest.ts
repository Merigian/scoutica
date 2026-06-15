import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes Scoutica installable ("Add to Home Screen") and,
 * once launched from the home screen, run in standalone mode (no browser
 * chrome) so it feels like a native app. Next.js serves this at
 * /manifest.webmanifest and links it automatically.
 *
 * The site is rendered on the forced "Atelier Noir" dark theme
 * (--bg #0A0A0B), so the splash/background and theme color match obsidian.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scoutica — Scouting professionale",
    short_name: "Scoutica",
    description:
      "La piattaforma professionale che connette modelli con scout, agenzie e brand verificati in Italia.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    lang: "it",
    dir: "ltr",
    categories: ["business", "lifestyle", "social"],
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
