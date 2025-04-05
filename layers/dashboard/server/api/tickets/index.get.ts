import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { supportTickets, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  // Get user session from event context (populated by nuxt-auth-utils)
  const session = await getUserSession(event);

  // Check if user session and email exist
  if (!session?.user?.email) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: No valid session found",
    });
  }

  const db = getDb(event);

  // Fetch user from DB based on session email to get their ID
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
      statusMessage: "Server Error: Could not fetch user data",
    });
  }

  if (!user) {
    // This case might indicate an issue if session exists but DB user doesn't
    console.error(`Session email ${session.user.email} not found in database.`);
    throw createError({
      statusCode: 404,
      statusMessage: "Authenticated user not found in database",
    });
  }

  // Fetch tickets for the user
  try {
    const tickets = await db.query.supportTickets.findMany({
      where: eq(supportTickets.clientId, user.id),
      orderBy: (tickets, { desc }) => [desc(tickets.lastRepliedAt)],
      columns: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastRepliedAt: true,
      },
      with: {
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

    return { success: true, tickets: transformedTickets };
  } catch (dbError) {
    console.error("Database Error fetching tickets:", dbError);
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not fetch support tickets",
    });
  }
});
