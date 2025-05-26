import { defineEventHandler, createError } from "h3";
import { getDb } from "../../../../../../server/utils/db";
import { users } from "../../../../../../server/db/schema";
import { desc, isNotNull } from "drizzle-orm";
import { isSuperAdmin } from "#layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  // Check for super admin session
  const session = await getUserSession(event);
  const user = session?.user;

  if (!user || !isSuperAdmin(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Super admin access required.",
    });
  }

  try {
    const db = getDb(event);

    // Fetch all soft-deleted users
    const deletedUsers = await db.query.users.findMany({
      where: isNotNull(users.deletedAt),
      orderBy: [desc(users.deletedAt)],
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        deletedAt: true,
        createdAt: true,
        avatarUrl: true,
      },
    });

    return {
      success: true,
      users: deletedUsers,
      count: deletedUsers.length,
    };
  } catch (error: any) {
    console.error("[API][Admin][DeletedUsers] Error fetching deleted users:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch deleted users.",
      data: error.message,
    });
  }
});