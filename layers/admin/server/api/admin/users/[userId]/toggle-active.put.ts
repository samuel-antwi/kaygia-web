import { defineEventHandler, getRouterParam, readBody } from "h3";
import { getDb } from "~/server/utils/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

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

  if (!adminUser || adminUser.role !== "ADMIN") {
    console.warn(
      `[API][Admin][User:${userId}/toggle-active] Unauthorized attempt. User: ${adminUser?.id}, Role: ${adminUser?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  // 2. Prevent self-deactivation
  if (userId === adminUser.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: You cannot change your own account status.",
    });
  }

  // 3. Read request body for active state
  const body = await readBody(event);
  // Convert to boolean to ensure proper type
  const active = !!body?.active;

  try {
    const db = getDb(event);
    const now = new Date();

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        active: true,
      },
    });

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: User does not exist.",
      });
    }

    // Don't update if status is the same
    if (existingUser.active === active) {
      return {
        success: true,
        message: `User account is already ${active ? "active" : "inactive"}.`,
        user: existingUser,
      };
    }

    // Update the user's active status
    const [updatedUser] = await db
      .update(users)
      .set({
        active,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        active: users.active,
      });

    // Return success response
    return {
      success: true,
      message: `User account ${active ? "activated" : "deactivated"} successfully.`,
      user: updatedUser,
      previousStatus: existingUser.active,
    };
  } catch (error: any) {
    // Handle potential errors
    if (error.statusCode) {
      throw error; // Re-throw HTTP errors
    }

    console.error(
      `[API][Admin][User:${userId}/toggle-active] Error updating status:`,
      error
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not update user status.",
      data: error.message,
    });
  }
});
