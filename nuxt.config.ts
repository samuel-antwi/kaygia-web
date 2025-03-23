// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ["./layers/core", "./layers/marketing", "./layers/app"],
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt", "@nuxtjs/color-mode"],

  css: ["~/assets/css/globals.css", "~/assets/css/tailwind.css"],

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

  app: {
    head: {
      title: "Web Agency Platform",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Professional web development agency platform",
        },
      ],
    },
  },

  compatibilityDate: "2025-03-23",
});
