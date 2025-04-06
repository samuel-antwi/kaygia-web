import { defineEventHandler, getRouterParam, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { manageEmailVerification } from "~/server/utils/email-verification";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";

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
      `[API][Admin][User:${userId}/verify-email] Unauthorized attempt. User: ${adminUser?.id}, Role: ${adminUser?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    const db = getDb(event);

    // Use the shared email verification utility to verify immediately
    const result = await manageEmailVerification({
      userId,
      db,
      verifyImmediately: true, // Immediately mark as verified without sending email
    });

    return {
      success: true,
      message: result.message,
      user: result.user,
    };
  } catch (error: any) {
    // Handle specific errors with appropriate status codes
    if (error.message === "User not found") {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: User does not exist.",
      });
    }

    console.error(
      `[API][Admin][User:${userId}/verify-email] Error verifying email:`,
      error
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not verify email.",
      data: error.message,
    });
  }
});
