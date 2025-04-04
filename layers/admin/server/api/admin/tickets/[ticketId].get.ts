import { defineEventHandler, getRouterParam } from "h3";
import { getDb } from "~/server/utils/db";
import { supportTickets, users, ticketComments } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const ticketId = getRouterParam(event, "ticketId");

  if (!ticketId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Missing ticket ID",
    });
  }

  const session = await getUserSession(event);
  const user = session?.user;

  if (!user || user.role !== "ADMIN") {
    console.warn(
      `[API][Admin][${ticketId}] Unauthorized access attempt. User found: ${!!user}, Role: ${user?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    const db = getDb(event);
    const ticket = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, ticketId),
      with: {
        client: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: (comments, { asc }) => [asc(comments.createdAt)],
        },
      },
    });

    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Ticket does not exist.",
      });
    }

    return {
      success: true,
      ticket,
    };
  } catch (error: any) {
    // Handle potential errors
    if (error.message?.includes("invalid input syntax")) {
      console.warn(`[API][Admin][${ticketId}] Invalid ticket ID format.`);
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Invalid ticket ID format.",
      });
    }

    console.error(
      `[API][Admin][${ticketId}] Error fetching ticket details:`,
      error
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch ticket details.",
      data: error.message,
    });
  }
});
