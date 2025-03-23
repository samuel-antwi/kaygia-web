// Core layer configuration
export default defineNuxtConfig({
  css: ["~/assets/css/tailwind.css"],
  modules: ["@nuxtjs/tailwindcss"],
  // @ts-ignore - tailwindcss module options
  tailwindcss: {
    configPath: "tailwind.config.ts",
    exposeConfig: true,
    viewer: true,
  },
});
