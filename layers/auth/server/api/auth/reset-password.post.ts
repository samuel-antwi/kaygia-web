import { H3Event } from "h3";
import { getDb } from "../../../../../server/utils/db";
import { createPasswordReset } from "../../../../../server/utils/password-reset";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const { email } = await readBody(event);
    const db = getDb(event);

    // Validate required fields
    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    // Use the shared password reset utility
    return await createPasswordReset({
      email,
      db,
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "An error occurred while processing your request",
    };
  }
});
