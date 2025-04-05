import { defineEventHandler, getRouterParam, readBody } from "h3";
import { getDb } from "~/server/utils/db";
import { users, roleEnum } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "userId");

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Missing user ID",
    });
  }

  // 1. Check for admin user session
  const session = await getUserSession(event);
  const adminUser = session?.user;

  if (!adminUser || adminUser.role !== "ADMIN") {
    console.warn(
      `[API][Admin][User:${userId}/role] Unauthorized attempt. User: ${adminUser?.id}, Role: ${adminUser?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  // 2. Prevent self-demotion
  if (userId === adminUser.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: You cannot change your own role.",
    });
  }

  // 3. Read and validate request body
  const body = await readBody(event);
  const newRole = body?.role;

  // Validate role value
  if (!newRole || !roleEnum.enumValues.includes(newRole)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bad Request: Invalid role value. Must be one of: ${roleEnum.enumValues.join(", ")}`,
    });
  }

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
        role: true,
      },
    });

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: User does not exist.",
      });
    }

    // Don't update if role is the same
    if (existingUser.role === newRole) {
      return {
        success: true,
        message: `User already has role ${newRole}.`,
        user: existingUser,
      };
    }

    // Update the user's role
    const [updatedUser] = await db
      .update(users)
      .set({
        role: newRole,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      });

    // Return success response
    return {
      success: true,
      message: `User role updated from ${existingUser.role} to ${newRole}.`,
      user: updatedUser,
      previousRole: existingUser.role,
    };
  } catch (error: any) {
    // Handle potential errors
    if (error.message?.includes("invalid input syntax")) {
      console.warn(`[API][Admin][User:${userId}/role] Invalid user ID format.`);
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Invalid user ID format.",
      });
    }

    console.error(
      `[API][Admin][User:${userId}/role] Error updating role:`,
      error
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not update user role.",
      data: error.message,
    });
  }
});
