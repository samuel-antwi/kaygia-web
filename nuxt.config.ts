// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: [
    "./layers/core",
    "./layers/marketing",
    "./layers/app",
    "./layers/auth",
  ],
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "nuxt-auth-utils",
  ],

  css: ["~/assets/css/tailwind.css"],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  colorMode: {
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
});
