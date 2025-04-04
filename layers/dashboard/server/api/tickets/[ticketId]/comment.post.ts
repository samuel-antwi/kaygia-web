import { z } from "zod";
import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { supportTickets, users, ticketComments } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Zod schema for input validation
const addCommentSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }),
});

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

  // 3. Read and Validate Request Body
  const body = await readBody(event);
  const validation = addCommentSchema.safeParse(body);
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Invalid input: " +
        validation.error.errors.map((e) => e.message).join(", "),
    });
  }
  const { content } = validation.data;

  // 4. Verify Ticket Exists and Belongs to User
  let ticket;
  try {
    ticket = await db.query.supportTickets.findFirst({
      where: and(
        eq(supportTickets.id, ticketId),
        eq(supportTickets.clientId, user.id)
      ),
      columns: { id: true, status: true },
    });
  } catch (dbError) {
    console.error("Database Error verifying ticket ownership:", dbError);
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error verifying ticket",
    });
  }

  if (!ticket) {
    throw createError({
      statusCode: 404,
      statusMessage: "Ticket not found or access denied",
    });
  }

  // Optional: Prevent adding comments to closed tickets
  if (ticket.status === "CLOSED") {
    throw createError({
      statusCode: 403,
      statusMessage: "Cannot add comments to a closed ticket",
    });
  }

  // 5. Create Comment and Update Ticket Timestamp in Transaction
  try {
    const now = new Date();
    const [newComment] = await db.transaction(async (tx) => {
      // Create the new comment
      const comment = await tx
        .insert(ticketComments)
        .values({
          id: uuidv4(),
          content: content,
          ticketId: ticket.id,
          userId: user.id,
          sender: "CLIENT",
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // Update the ticket's lastRepliedAt and potentially status
      await tx
        .update(supportTickets)
        .set({
          lastRepliedAt: now,
          updatedAt: now,
          // If admin replies, status might change to PENDING,
          // if client replies, status might change from PENDING back to OPEN
          // For now, if client replies, ensure it's not stuck in PENDING
          status: ticket.status === "PENDING" ? "OPEN" : ticket.status,
        })
        .where(eq(supportTickets.id, ticket.id));

      // Include user details in the response for immediate display
      const commentWithUser = await tx.query.ticketComments.findFirst({
        where: eq(ticketComments.id, comment[0].id),
        with: {
          user: {
            columns: { name: true, id: true },
          },
        },
      });

      return [commentWithUser];
    });

    return { success: true, comment: newComment };
  } catch (dbError) {
    console.error(
      "Database Error creating comment or updating ticket:",
      dbError
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not add comment",
    });
  }
});
