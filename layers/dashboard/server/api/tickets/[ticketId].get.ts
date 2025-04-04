import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { supportTickets, users } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // 1. Get User Session & ID
  const session = await getUserSession(event);
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const db = getDb(event);

  let user;
  try {
    user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true },
    });
  } catch (dbError) {
    console.error("Database Error fetching user:", dbError);
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not fetch user",
    });
  }
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  // 2. Get Ticket ID from route parameters
  const ticketId = event.context.params?.ticketId;
  if (!ticketId) {
    throw createError({ statusCode: 400, statusMessage: "Missing ticket ID" });
  }

  // 3. Fetch the specific ticket and its comments
  try {
    const ticket = await db.query.supportTickets.findFirst({
      where: and(
        eq(supportTickets.id, ticketId),
        // Security Check: Ensure the logged-in user is the client for this ticket
        eq(supportTickets.clientId, user.id)
      ),
      with: {
        // Include comments, ordered chronologically
        comments: {
          with: {
            user: {
              columns: { name: true, id: true },
            },
          },
          orderBy: (comments, { asc }) => [asc(comments.createdAt)],
        },
        // Include client info (optional, if needed on detail view)
        client: {
          columns: { name: true, email: true },
        },
      },
    });

    // Check if ticket was found and belongs to the user
    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: "Ticket not found or access denied",
      });
    }

    return { success: true, ticket };
  } catch (dbError) {
    // Handle potential database errors
    console.error("Database Error fetching ticket details:", dbError);
    // Don't expose detailed errors to client
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not fetch ticket details",
    });
  }
});
