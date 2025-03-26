// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ["./layers/core", "./layers/marketing", "./layers/app"],
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
    session: {
      maxAge: 60 * 60 * 24 * 7,
      // Ensure strong password for cookie encryption
      password: process.env.NUXT_SESSION_PASSWORD || "",

      // Enhance cookie security in production
      cookie:
        process.env.NODE_ENV === "production"
          ? {
              sameSite: "lax",
              secure: true,
              httpOnly: true,
            }
          : undefined,
    },

    public: {},
  },
});
