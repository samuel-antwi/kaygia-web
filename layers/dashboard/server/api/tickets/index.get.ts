import { PrismaClient, TicketStatus } from "@prisma/client";

const prisma = new PrismaClient();

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

  // Fetch user from DB based on session email to get their ID
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
  } catch (dbError) {
    console.error("Prisma Error fetching user:", dbError);
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
    const tickets = await prisma.supportTicket.findMany({
      where: {
        clientId: user.id,
      },
      orderBy: {
        lastRepliedAt: "desc", // Show most recently active tickets first
      },
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastRepliedAt: true,
        _count: {
          // Include comment count
          select: { comments: true },
        },
        // Maybe include last comment snippet later if needed
      },
    });

    return { success: true, tickets };
  } catch (dbError) {
    console.error("Prisma Error fetching tickets:", dbError);
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not fetch support tickets",
    });
  }
});
