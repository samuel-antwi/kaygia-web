// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Define auth layer configuration
  modules: [
    // Add modules specific to auth layer if needed
    "nuxt-auth-utils",
  ],

  // Enable TypeScript for this layer
  typescript: {
    strict: true,
  },
});
