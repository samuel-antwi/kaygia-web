import { db } from "../db";

export default defineNitroPlugin((nitroApp) => {
  // Make db available in event context
  nitroApp.hooks.hook("request", (event) => {
    event.context.db = db;
  });
});
