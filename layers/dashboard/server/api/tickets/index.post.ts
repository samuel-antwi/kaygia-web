import { z } from "zod";
import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { supportTickets, users, ticketComments } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Zod schema for input validation
const createTicketSchema = z.object({
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters long" }),
  content: z.string().min(10, {
    message: "Initial message content must be at least 10 characters long",
  }),
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

  // 2. Read and Validate Request Body
  const body = await readBody(event);
  const validation = createTicketSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Invalid input: " +
        validation.error.errors.map((e) => e.message).join(", "),
    });
  }

  const { subject, content } = validation.data;

  // 3. Create Ticket and Initial Comment in a Transaction
  try {
    const now = new Date();
    const ticketId = uuidv4();

    const [newTicket] = await db.transaction(async (tx) => {
      // Create the ticket
      const [ticket] = await tx
        .insert(supportTickets)
        .values({
          id: ticketId,
          subject: subject,
          description: content, // Use initial content as description
          clientId: user.id,
          status: "OPEN",
          createdAt: now,
          updatedAt: now,
          lastRepliedAt: now,
        })
        .returning();

      // Create the initial comment from the client
      await tx.insert(ticketComments).values({
        id: uuidv4(),
        content: content,
        ticketId: ticketId,
        userId: user.id,
        sender: "CLIENT",
        createdAt: now,
        updatedAt: now,
      });

      return [ticket];
    });

    // Return only essential ticket info on creation
    return {
      success: true,
      ticket: {
        id: newTicket.id,
        subject: newTicket.subject,
        status: newTicket.status,
        createdAt: newTicket.createdAt,
      },
    };
  } catch (dbError) {
    console.error("Database Error creating ticket/comment:", dbError);
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not create support ticket",
    });
  }
});
