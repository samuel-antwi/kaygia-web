import { defineEventHandler } from "h3";
import { getDb } from "../../../../../../server/utils/db";
import { supportTickets, users, ticketComments } from "../../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { roleEnum } from "../../../../../../server/db/schema";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  // --- START DEBUG LOGGING ---
  // Logging the attempt to get session

  const session = await getUserSession(event);

  // --- END DEBUG LOGGING ---

  // 1. Check for admin user session using getUserSession
  // const user = event.context.userSession?.user; // Previous method
  const user = session?.user; // Get user from the awaited session object

  if (!user || !hasAdminAccess(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    const db = getDb(event);
    const tickets = await db.query.supportTickets.findMany({
      orderBy: (tickets, { desc }) => [desc(tickets.createdAt)],
      with: {
        client: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: true,
      },
    });

    // Transform the data to match the expected format
    const transformedTickets = tickets.map((ticket) => ({
      ...ticket,
      _count: {
        comments: ticket.comments.length,
      },
      // Remove the comments array since we only need the count
      comments: undefined,
    }));

    return {
      success: true,
      tickets: transformedTickets,
    };
  } catch (error: any) {
    console.error("[API][Admin] Error fetching tickets:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch tickets.",
      data: error.message,
    });
  }
});
