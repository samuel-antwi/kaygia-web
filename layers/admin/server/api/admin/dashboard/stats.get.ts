import { defineEventHandler, createError } from "h3";
import { getDb } from "../../../../../../server/utils/db";
import { supportTickets, users, projects, conversations, messages } from "../../../../../../server/db/schema";
import { count, eq, ne, and, gte, sql, isNull } from "drizzle-orm";
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

    // Get total user count (excluding deleted)
    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(isNull(users.deletedAt));

    // Get new users this month count (excluding deleted)
    const newUsers = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, firstDayOfMonth),
          isNull(users.deletedAt)
        )
      );

    // Get total project count
    const totalProjects = await db.select({ count: count() }).from(projects);

    // Get in-progress project count
    const inProgressProjects = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.status, "IN_PROGRESS"));

    // Get messaging stats
    const totalConversations = await db
      .select({ count: count() })
      .from(conversations);

    const activeConversations = await db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.status, "active"));

    // Get unread messages count (messages without read receipts from admins)
    const unreadMessages = await db
      .select({ count: count() })
      .from(messages)
      .where(
        sql`NOT EXISTS (
          SELECT 1 FROM message_read_receipts mrr
          JOIN users u ON mrr.user_id = u.id
          WHERE mrr.message_id = ${messages.id}
          AND u.role = 'ADMIN'
        )`
      );

    return {
      success: true,
      stats: {
        tickets: {
          total: totalTickets[0]?.count || 0,
          open: openTickets[0]?.count || 0,
        },
        users: {
          total: totalUsers[0]?.count || 0,
          newThisMonth: newUsers[0]?.count || 0,
        },
        projects: {
          total: totalProjects[0]?.count || 0,
          inProgress: inProgressProjects[0]?.count || 0,
        },
        messages: {
          conversations: totalConversations[0]?.count || 0,
          activeConversations: activeConversations[0]?.count || 0,
          unreadMessages: unreadMessages[0]?.count || 0,
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
