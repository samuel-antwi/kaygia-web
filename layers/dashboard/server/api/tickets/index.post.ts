import { PrismaClient, TicketStatus, CommentSender } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

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
    const newTicket = await prisma.$transaction(async (tx) => {
      // Create the ticket
      const ticket = await tx.supportTicket.create({
        data: {
          subject: subject,
          clientId: user.id,
          status: TicketStatus.OPEN, // Default status
          // lastRepliedAt will default to now()
        },
      });

      // Create the initial comment from the client
      await tx.ticketComment.create({
        data: {
          content: content,
          ticketId: ticket.id,
          userId: user.id, // Comment is from the client
          sender: CommentSender.CLIENT, // Mark sender as CLIENT
        },
      });

      // We don't explicitly update lastRepliedAt here,
      // relying on potential future triggers or batch updates if high precision is needed.
      // For now, the ticket's createdAt/updatedAt can approximate activity start.

      return ticket; // Return the created ticket
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
    console.error("Prisma Error creating ticket/comment:", dbError);
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not create support ticket",
    });
  }
});
