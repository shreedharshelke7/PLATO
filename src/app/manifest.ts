import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PLATO | Ambrosia — Fuel Like a God",
    short_name: "Ambrosia",
    description: "AI-powered nutrition, smart hydration, and Divine Swaps for mortals and Olympians.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0614",
    theme_color: "#c89b3c",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
