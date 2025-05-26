import { defineEventHandler, createError } from "h3";
import { getDb } from "../../../../../../server/utils/db";
import { users } from "../../../../../../server/db/schema";
import { desc, isNull } from "drizzle-orm";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  // 1. Check for admin user session
  const session = await getUserSession(event);
  const user = session?.user;

  if (!user || !hasAdminAccess(user.role)) {
    console.warn(
      `[API][Admin][Users] Unauthorized access attempt. User found: ${!!user}, Role: ${user?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    const db = getDb(event);

    // Fetch all users with selected columns for security, excluding soft-deleted users
    const allUsers = await db.query.users.findMany({
      where: isNull(users.deletedAt),
      orderBy: [desc(users.createdAt)],
      columns: {
        // Exclude sensitive information
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        avatarUrl: true,
        // Exclude password hash and other sensitive data
      },
    });

    return {
      success: true,
      users: allUsers,
      count: allUsers.length,
    };
  } catch (error: any) {
    console.error("[API][Admin][Users] Error fetching users:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch users.",
      data: error.message,
    });
  }
});
