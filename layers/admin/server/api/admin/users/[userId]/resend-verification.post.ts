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
      `[API][Admin][User:${userId}/resend-verification] Unauthorized attempt. User: ${adminUser?.id}, Role: ${adminUser?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    const db = getDb(event);

    // Use the shared email verification utility with default email sender
    const result = await manageEmailVerification({
      userId,
      db,
      verifyImmediately: false, // Send a verification email
      // No need to provide sendVerificationEmail, will use the default
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

    if (error.message?.includes("Email is already verified")) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Email is already verified.",
      });
    }

    console.error(
      `[API][Admin][User:${userId}/resend-verification] Error resending verification:`,
      error
    );
    throw createError({
      statusCode: 500,
      statusMessage:
        "Internal Server Error: Could not resend verification email.",
      data: error.message,
    });
  }
});
