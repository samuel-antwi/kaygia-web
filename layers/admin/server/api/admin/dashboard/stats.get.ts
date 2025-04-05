import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { supportTickets, users, projects } from "~/server/db/schema";
import { count, eq, ne, and, or, gte, desc, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and admin role
    const session = await getUserSession(event);
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
      console.warn(
        `[API][Admin][Dashboard] Unauthorized access attempt. User found: ${!!user}, Role: ${user?.role}`
      );
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Admin access required.",
      });
    }

    const db = getDb(event);

    // Get current date and first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total ticket count
    const totalTickets = await db
      .select({ count: count() })
      .from(supportTickets);

    // Get open ticket count
    const openTickets = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(
        and(
          ne(supportTickets.status, "CLOSED"),
          ne(supportTickets.status, "RESOLVED")
        )
      );

    // Get total user count
    const totalUsers = await db.select({ count: count() }).from(users);

    // Get new users this month count
    const newUsers = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, firstDayOfMonth));

    // Get total project count
    const totalProjects = await db.select({ count: count() }).from(projects);

    // Get in-progress project count
    const inProgressProjects = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.status, "IN_PROGRESS"));

    return {
      success: true,
      stats: {
        tickets: {
          total: totalTickets[0].count,
          open: openTickets[0].count,
        },
        users: {
          total: totalUsers[0].count,
          newThisMonth: newUsers[0].count,
        },
        projects: {
          total: totalProjects[0].count,
          inProgress: inProgressProjects[0].count,
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch dashboard statistics",
    };
  }
});
