import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { users } from "~/server/db/schema";
import { desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // 1. Check for admin user session
  const session = await getUserSession(event);
  const user = session?.user;

  if (!user || user.role !== "ADMIN") {
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

    // Fetch all users with selected columns for security
    const allUsers = await db.query.users.findMany({
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
