import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // 1. Get User Session & ID
  const session = await getUserSession(event);
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
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
    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
        // Security Check: Ensure the logged-in user is the client for this ticket
        clientId: user.id,
      },
      include: {
        // Include comments, ordered chronologically
        comments: {
          orderBy: {
            createdAt: "asc",
          },
          // Include commenter's name for display
          include: {
            user: {
              select: { name: true, id: true },
            },
          },
        },
        // Include client info (optional, if needed on detail view)
        client: {
          select: { name: true, email: true },
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
    // Handle potential Prisma errors (e.g., invalid ID format)
    console.error("Prisma Error fetching ticket details:", dbError);
    // Don't expose detailed Prisma errors to client
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not fetch ticket details",
    });
  }
});
