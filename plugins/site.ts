import { siteConfig } from "~/utils/config/site";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      site: siteConfig,
    },
  };
});
