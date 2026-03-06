import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
      includeAssets: [
        "logo-stability.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],
      manifest: {
        name: "Stability Platform",
        short_name: "Stability",
        description: "Plataforma de entrenamiento y gestión",
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Solo precachear assets estáticos e index.html (necesario para navigateFallback)
        globPatterns: ["**/*.{png,svg,ico,woff2}", "index.html"],
        cleanupOutdatedCaches: true,
        // Ambos en true: nuevo SW toma control inmediatamente
        clientsClaim: true,
        skipWaiting: true,
        // CRÍTICO para SPA: todas las navegaciones devuelven index.html
        navigateFallback: "index.html",
        // No interceptar requests a Supabase ni API
        navigateFallbackDenylist: [/^\/api/, /supabase\.co/, /\.well-known/],
        runtimeCaching: [
          // JS/CSS → NetworkFirst: siempre intentar versión fresca
          // Evita servir JS viejo que no coincide con el HTML actual
          {
            urlPattern: /\.(?:js|css)$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "static-resources",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días
              },
            },
          },
          // Supabase API → NetworkOnly: nunca cachear datos
          {
            urlPattern: ({ url }) => url.origin.includes(".supabase.co"),
            handler: "NetworkOnly",
            options: {
              cacheName: "api-cache",
            },
          },
          // Imágenes → CacheFirst: cachear agresivamente
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
              },
            },
          },
          // Google Fonts stylesheets
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          // Google Fonts webfonts
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    drop: mode === "production" ? (["console", "debugger"] as const) : [],
  },
}));
