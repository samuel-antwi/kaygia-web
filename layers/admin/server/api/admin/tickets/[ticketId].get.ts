import { defineEventHandler, getRouterParam } from "h3";
import { Role } from "@prisma/client";

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

  if (!user || user.role !== Role.ADMIN) {
    console.warn(
      `[API][Admin][${ticketId}] Unauthorized access attempt. User found: ${!!user}, Role: ${user?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  try {
    // 2. Fetch the specific ticket with client and comments (including comment author)
    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        client: {
          // Include the client user details
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          // Include all comments for this ticket
          orderBy: {
            createdAt: "asc", // Show comments in chronological order
          },
          include: {
            user: {
              // Include the author of each comment
              select: {
                id: true,
                name: true,
                email: true,
                role: true, // Include role to differentiate admin/client comments
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Ticket does not exist.",
      });
    }

    // 3. Return the detailed ticket data
    return {
      success: true,
      ticket,
    };
  } catch (error: any) {
    // Handle potential Prisma errors (e.g., invalid ID format) or other issues
    if (
      error.code === "P2023" ||
      error.message.includes("Malformed ObjectID")
    ) {
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
