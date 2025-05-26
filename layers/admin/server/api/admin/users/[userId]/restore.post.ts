import { getDb } from "../../../../../../../server/utils/db";
import { users } from "../../../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { defineEventHandler, createError, getRouterParam } from "h3";
import { isSuperAdmin } from "#layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  try {
    // Verify super admin session
    const session = await getUserSession(event);
    const adminUser = session?.user;

    if (!adminUser || !isSuperAdmin(adminUser.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Only super admins can restore users.",
      });
    }

    // Get user ID from URL
    const userId = getRouterParam(event, "userId");
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Missing user ID",
      });
    }

    // Get database instance
    const db = getDb(event);

    // Check if user exists and is deleted
    const [userToRestore] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userToRestore) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: User does not exist.",
      });
    }

    if (!userToRestore.deletedAt) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: User is not deleted.",
      });
    }

    // Restore the user by clearing deletedAt and setting active to true
    const now = new Date();
    await db
      .update(users)
      .set({
        deletedAt: null,
        active: true,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    // Return success response
    return {
      success: true,
      message: "User restored successfully",
    };
  } catch (error: any) {
    // If it's already a HTTP error, just re-throw it
    if (error.statusCode) {
      throw error;
    }

    console.error("Error restoring user:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not restore user.",
      data: error.message,
    });
  }
});
