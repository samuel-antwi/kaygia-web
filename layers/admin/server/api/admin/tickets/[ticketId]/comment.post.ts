import { defineEventHandler, getRouterParam, readBody } from "h3";
import { getDb } from "~/server/utils/db";
import { supportTickets, ticketComments } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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

  if (!user || user.role !== "ADMIN") {
    console.warn(
      `[API][Admin][${ticketId}/comment] Unauthorized attempt. User: ${user?.id}, Role: ${user?.role}`
    );
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  // 2. Read and validate request body
  const body = await readBody(event);
  const content = body?.content?.trim();

  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Comment content cannot be empty.",
    });
  }

  try {
    const db = getDb(event);
    const now = new Date();

    // First check if ticket exists
    const ticket = await db.query.supportTickets.findFirst({
      where: eq(supportTickets.id, ticketId),
    });

    if (!ticket) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Ticket does not exist.",
      });
    }

    // Create comment and update ticket in a transaction
    const [newComment] = await db.transaction(async (tx) => {
      // Create the comment
      const comment = await tx
        .insert(ticketComments)
        .values({
          id: uuidv4(),
          content: content,
          ticketId: ticketId,
          userId: user.id,
          sender: "ADMIN",
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // Update the ticket timestamps
      await tx
        .update(supportTickets)
        .set({
          updatedAt: now,
          lastRepliedAt: now,
        })
        .where(eq(supportTickets.id, ticketId));

      return comment;
    });

    // 4. Return success response
    return {
      success: true,
      message: "Comment added successfully.",
      comment: newComment,
    };
  } catch (error: any) {
    // Handle potential errors
    if (error.message?.includes("invalid input syntax")) {
      console.warn(
        `[API][Admin][${ticketId}/comment] Invalid ticket ID format.`
      );
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request: Invalid ticket ID format.",
      });
    }

    console.error(
      `[API][Admin][${ticketId}/comment] Error adding comment:`,
      error
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not add comment.",
      data: error.message,
    });
  }
});
