// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Define auth layer configuration
  modules: ["nuxt-auth-utils"],

  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 7,
      password: process.env.NUXT_SESSION_PASSWORD || "",
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

  // Enable TypeScript for this layer
  typescript: {
    strict: true,
  },
});
