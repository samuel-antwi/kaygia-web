import site from "~/utils/config/site";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      site,
    },
  };
});
