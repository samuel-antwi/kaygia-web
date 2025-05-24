import { getDb } from "~/server/utils/db";
import { users, projects, supportTickets } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { defineEventHandler, createError, getRouterParam } from "h3";
import { canDeleteUsers } from "~/layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  try {
    // Verify admin session
    const session = await getUserSession(event);
    const adminUser = session?.user;

    if (!adminUser || !canDeleteUsers(adminUser.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Only super admins can delete users.",
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

    // Prevent self-deletion
    if (userId === adminUser.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: You cannot delete your own account.",
      });
    }

    // Get database instance
    const db = getDb(event);

    // Check if user exists
    const [userToDelete] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userToDelete) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: User does not exist.",
      });
    }

    // Check if user has associated data (optional - depends on business rules)
    const userProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.clientId, userId));
    const projectCount = userProjects.length;

    const userTickets = await db
      .select({ id: supportTickets.id })
      .from(supportTickets)
      .where(eq(supportTickets.clientId, userId));
    const ticketCount = userTickets.length;

    // You might want to prevent deletion if user has data
    // Uncomment if needed:
    /*
    if (projectCount.count > 0 || ticketCount.count > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot delete user with existing projects or tickets. Please reassign or delete them first.",
      });
    }
    */

    // Soft delete the user by setting deletedAt timestamp
    const now = new Date();
    await db
      .update(users)
      .set({ 
        deletedAt: now,
        active: false, // Also mark as inactive
        updatedAt: now
      })
      .where(eq(users.id, userId));

    // Return success response
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error: any) {
    // If it's already a HTTP error, just re-throw it
    if (error.statusCode) {
      throw error;
    }

    console.error("Error deleting user:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not delete user.",
      data: error.message,
    });
  }
});