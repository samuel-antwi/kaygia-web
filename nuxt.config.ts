// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import type { UserConfig } from "vite";

export default defineNuxtConfig({
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
    componentDir: "./components/ui",
  },

  compatibilityDate: "2025-03-23",

  runtimeConfig: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,

    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      NUXT_PUBLIC_SITE_URL:
        process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  },

  nitro: {
    externals: {
      external: ["@prisma/client"],
    },
  },

  hooks: {
    "vite:extendConfig": (config: UserConfig) => {
      config.optimizeDeps = config.optimizeDeps || {};
      config.optimizeDeps.exclude = config.optimizeDeps.exclude || [];
      config.optimizeDeps.exclude.push("@prisma/client");

      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      (config.resolve.alias as Record<string, string>)[
        ".prisma/client/index-browser"
      ] = "@prisma/client/index-browser";
    },
  },
});
