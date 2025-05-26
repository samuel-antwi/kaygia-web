import { defineEventHandler, getRouterParam, createError } from "h3";
import { getDb } from "../../../../../../../server/utils/db";
import { createPasswordReset } from "../../../../../../../server/utils/password-reset";
import { users } from "../../../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "~/utils/email";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "userId");

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Missing user ID",
    });
  }

  // Check for admin user session
  const session = await getUserSession(event);
  const adminUser = session?.user;

  if (!adminUser || !hasAdminAccess(adminUser.role)) {
    console.warn(
      `[API][Admin][User:${userId}/reset-password] Unauthorized attempt. User: ${adminUser?.id}, Role: ${adminUser?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    const db = getDb(event);

    // Use the shared password reset utility
    return await createPasswordReset({
      userId,
      db,
    });
  } catch (error: any) {
    console.error(`[API][Admin][User:${userId}/reset-password] Error:`, error);

    if (error.statusCode) {
      throw error; // Re-throw HTTP errors
    }

    if (error.message === "User not found") {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Failed to initiate password reset",
      data: error.message,
    });
  }
});
