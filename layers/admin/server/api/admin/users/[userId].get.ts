import { defineEventHandler, getRouterParam } from "h3";
import { getDb } from "~/server/utils/db";
import { users, supportTickets, projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";

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

  if (!adminUser || !hasAdminAccess(adminUser.role)) {
    console.warn(
      `[API][Admin][User:${userId}] Unauthorized access attempt. User found: ${!!adminUser}, Role: ${adminUser?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    const db = getDb(event);

    // Fetch the user with selected columns, excluding sensitive data
    const userData = await db.query.users.findFirst({
      where: eq(users.id, userId),
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
        company: true,
        lastLoggedIn: true,
        avatarUrl: true,
        // Exclude password hash and other sensitive data
      },
    });

    if (!userData) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: User does not exist.",
      });
    }

    // Fetch related tickets separately
    const userTickets = await db.query.supportTickets.findMany({
      where: eq(supportTickets.clientId, userId),
      columns: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    });

    // Fetch related projects separately
    const userProjects = await db.query.projects.findMany({
      where: eq(projects.clientId, userId),
      columns: {
        id: true,
        title: true,
        status: true,
        type: true,
        createdAt: true,
      },
    });

    // Calculate statistics for the response
    const stats = {
      totalTickets: userTickets.length,
      totalProjects: userProjects.length,
      ticketsByStatus: calculateTicketStats(userTickets),
      projectsByStatus: calculateProjectStats(userProjects),
    };

    return {
      success: true,
      user: {
        ...userData,
        stats,
        recentTickets: userTickets.slice(0, 5), // Include only 5 most recent tickets
        recentProjects: userProjects.slice(0, 5), // Include only 5 most recent projects
      },
    };
  } catch (error: any) {
    // Handle potential errors
    if (error.message?.includes("invalid input syntax")) {
      console.warn(`[API][Admin][User:${userId}] Invalid user ID format.`);
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Invalid user ID format.",
      });
    }

    console.error(
      `[API][Admin][User:${userId}] Error fetching user details:`,
      error
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch user details.",
      data: error.message,
    });
  }
});

// Helper function to calculate ticket statistics by status
function calculateTicketStats(tickets: { status: string }[]) {
  const stats = {
    OPEN: 0,
    PENDING: 0,
    RESOLVED: 0,
    CLOSED: 0,
  };

  for (const ticket of tickets) {
    // @ts-expect-error - Using string index
    if (stats[ticket.status] !== undefined) {
      // @ts-expect-error - Using string index
      stats[ticket.status]++;
    }
  }

  return stats;
}

// Helper function to calculate project statistics by status
function calculateProjectStats(projects: { status: string }[]) {
  const stats = {
    PENDING: 0,
    APPROVED: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  for (const project of projects) {
    // @ts-expect-error - Using string index
    if (stats[project.status] !== undefined) {
      // @ts-expect-error - Using string index
      stats[project.status]++;
    }
  }

  return stats;
}
