import { defineEventHandler } from "h3";
import { PrismaClient, Role } from "@prisma/client"; // Explicit import for clarity

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  console.log("[API][Admin] GET /api/admin/tickets - Handler Start");

  // --- START DEBUG LOGGING ---
  // Logging the attempt to get session
  console.log(
    "[API][Admin] Attempting to get user session via getUserSession(event)..."
  );
  const session = await getUserSession(event);
  console.log(
    "[API][Admin] Result from getUserSession(event):",
    JSON.stringify(session, null, 2)
  );
  // --- END DEBUG LOGGING ---

  // 1. Check for admin user session using getUserSession
  // const user = event.context.userSession?.user; // Previous method
  const user = session?.user; // Get user from the awaited session object

  if (!user || user.role !== Role.ADMIN) {
    console.warn(
      `[API][Admin] Unauthorized access attempt. User found via session: ${!!user}. User role: ${user?.role}` // Updated log message
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  console.log(
    `[API][Admin] User ${user.email} (Role: ${user.role}) is accessing admin tickets.`
  );

  try {
    // 2. Fetch all tickets from the database
    const tickets = await prisma.supportTicket.findMany({
      orderBy: {
        createdAt: "desc", // Show newest first
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          // Include the count of comments
          select: { comments: true },
        },
      },
    });

    console.log(`[API][Admin] Found ${tickets.length} tickets.`);

    // 3. Return the tickets
    return {
      success: true,
      tickets,
    };
  } catch (error: any) {
    console.error("[API][Admin] Error fetching tickets:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch tickets.",
      data: error.message, // Optional: include error message in development?
    });
  }
});
