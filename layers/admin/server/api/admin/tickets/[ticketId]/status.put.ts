import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { supportTickets, ticketStatusEnum } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  const ticketId = getRouterParam(event, "ticketId");

  if (!ticketId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Missing ticket ID",
    });
  }

  // 1. Check for admin user session
  const session = await getUserSession(event);
  const user = session?.user;

  if (!user || !hasAdminAccess(user.role)) {
    console.warn(
      `[API][Admin][${ticketId}/status] Unauthorized attempt. User: ${user?.id}, Role: ${user?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  // 2. Read and validate request body
  const body = await readBody(event);
  const status = body?.status;

  // Validate status value is one of the valid enum values
  if (!status || !ticketStatusEnum.enumValues.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bad Request: Invalid status value. Must be one of: ${ticketStatusEnum.enumValues.join(", ")}`,
    });
  }

  try {
    const db = getDb(event);
    const now = new Date();

    // Check if ticket exists
    const existingTicket = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, ticketId),
    });

    if (!existingTicket) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Ticket does not exist.",
      });
    }

    // Update the ticket status
    const [updatedTicket] = await db
      .update(supportTickets)
      .set({
        status: status,
        updatedAt: now,
      })
      .where(eq(supportTickets.id, ticketId))
      .returning();

    // Return success response
    return {
      success: true,
      message: "Ticket status updated successfully.",
      ticket: updatedTicket,
    };
  } catch (error: any) {
    // Handle potential errors
    if (error.message?.includes("invalid input syntax")) {
      console.warn(
        `[API][Admin][${ticketId}/status] Invalid ticket ID format.`
      );
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Invalid ticket ID format.",
      });
    }

    console.error(
      `[API][Admin][${ticketId}/status] Error updating status:`,
      error
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not update ticket status.",
      data: error.message,
    });
  }
});
