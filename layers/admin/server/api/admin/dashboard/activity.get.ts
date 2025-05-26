import { defineEventHandler, createError } from "h3";
import { getDb } from "../../../../../../server/utils/db";
import {
  supportTickets,
  users,
  projects,
} from "../../../../../../server/db/schema";
import { desc, or, gte } from "drizzle-orm";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  try {
    // Check authentication and admin role
    const session = await getUserSession(event);
    const user = session?.user;

    if (!user || !hasAdminAccess(user.role)) {
      console.warn(
        `[API][Admin][Dashboard] Unauthorized access attempt. User found: ${!!user}, Role: ${user?.role}`
      );
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: Admin access required.",
      });
    }

    const db = getDb(event);

    // Get date for last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Get recent ticket activities
    const recentTickets = await db.query.supportTickets.findMany({
      where: gte(supportTickets.createdAt, lastWeek),
      orderBy: [desc(supportTickets.createdAt)],
      limit: 5,
      with: {
        client: true,
      },
    });

    // Get recent project activities
    const recentProjects = await db.query.projects.findMany({
      where: or(
        gte(projects.createdAt, lastWeek),
        gte(projects.updatedAt, lastWeek)
      ),
      orderBy: [desc(projects.updatedAt)],
      limit: 5,
      with: {
        client: true,
      },
    });

    // Get new user sign-ups
    const newUsers = await db.query.users.findMany({
      where: gte(users.createdAt, lastWeek),
      orderBy: [desc(users.createdAt)],
      limit: 5,
    });

    // Format activities for the frontend
    const activities = [
      ...recentTickets.map((ticket) => ({
        id: `ticket-${ticket.id}`,
        type: "ticket",
        action: "New ticket created:",
        subject: ticket.subject,
        date: ticket.createdAt,
        link: `/admin/tickets/${ticket.id}`,
      })),
      ...recentProjects.map((project) => ({
        id: `project-${project.id}`,
        type: "project",
        action:
          project.createdAt > lastWeek
            ? "New project created:"
            : "Project updated:",
        subject: project.title,
        date: project.updatedAt,
        link: `/admin/projects/${project.id}`,
      })),
      ...newUsers.map((user) => ({
        id: `user-${user.id}`,
        type: "user",
        action: "New user registered:",
        subject: user.name || user.email,
        date: user.createdAt,
        link: `/admin/users/${user.id}`,
      })),
    ]
      // Sort by date descending (most recent first)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      // Limit to 10 activities
      .slice(0, 10);

    return {
      success: true,
      activities,
    };
  } catch (error: any) {
    console.error("Error fetching dashboard activity:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch dashboard activity",
    };
  }
});
