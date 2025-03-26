import { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Using nuxt-auth-utils to clear the session
    await clearUserSession(event);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error.message || "An error occurred during logout",
    };
  }
});
