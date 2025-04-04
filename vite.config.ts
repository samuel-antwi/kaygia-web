import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      ".prisma/client/index-browser": "@prisma/client/index-browser",
    },
  },
  optimizeDeps: {
    exclude: ["@prisma/client"],
  },
});
