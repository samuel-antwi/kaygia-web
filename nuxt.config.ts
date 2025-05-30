// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  extends: [
    "./layers/core",
    "./layers/marketing",
    "./layers/dashboard",
    "./layers/auth",
    "./layers/admin",
  ],
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "nuxt-auth-utils",
    "@pinia/nuxt",
    "@nuxt/fonts",
  ],

  css: ["~/assets/css/tailwind.css"],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  // @ts-ignore - Sometimes needed if type inference struggles
  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
  },

  shadcn: {
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./app/components/ui",
  },

  compatibilityDate: "2025-03-23",

  runtimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      NUXT_PUBLIC_SITE_URL:
        process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },

  build: {
    transpile: ["trpc-nuxt"],
  },

  vite: {
    optimizeDeps: {
      exclude: [],
    },
    define: {
      "window.global": {},
    },
  },
});
