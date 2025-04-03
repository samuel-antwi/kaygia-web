import { defineEventHandler, getRouterParam, readBody } from "h3";
import { PrismaClient, Role, CommentSender } from "@prisma/client";

const prisma = new PrismaClient();

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

  if (!user || user.role !== Role.ADMIN) {
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
    // 3. Use Prisma transaction to create comment AND update ticket timestamps
    const newComment = await prisma.$transaction(async (tx) => {
      // Create the comment
      const createdComment = await tx.ticketComment.create({
        data: {
          content: content,
          ticketId: ticketId,
          userId: user.id, // Link comment to the logged-in admin user
          sender: CommentSender.ADMIN, // Mark sender as ADMIN
        },
      });

      // Update the parent ticket's timestamps
      await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          updatedAt: new Date(), // Explicitly set update time
          lastRepliedAt: new Date(), // Update last reply time
          // Optional: Consider changing status back to OPEN or PENDING if admin replies?
          // status: TicketStatus.OPEN, // Or PENDING, depending on workflow
        },
      });

      return createdComment;
    });

    // 4. Return success response
    return {
      success: true,
      message: "Comment added successfully.",
      comment: newComment, // Optionally return the created comment
    };
  } catch (error: any) {
    // Handle potential errors (e.g., ticket not found during update)
    if (error.code === "P2025") {
      // Prisma code for record not found on update/delete
      console.error(
        `[API][Admin][${ticketId}/comment] Failed to find ticket ${ticketId} during transaction.`
      );
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Ticket does not exist.",
      });
    }
    // Handle invalid ID format for comment creation (less likely here, but good practice)
    if (
      error.code === "P2023" ||
      error.message.includes("Malformed ObjectID")
    ) {
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
