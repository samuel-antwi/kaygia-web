import { PrismaClient, CommentSender, TicketStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

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
    ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
        clientId: user.id, // Ensure user owns the ticket
      },
      select: { id: true, status: true }, // Select only needed fields
    });
  } catch (dbError) {
    console.error("Prisma Error verifying ticket ownership:", dbError);
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
  if (ticket.status === TicketStatus.CLOSED) {
    throw createError({
      statusCode: 403,
      statusMessage: "Cannot add comments to a closed ticket",
    });
  }

  // 5. Create Comment and Update Ticket Timestamp in Transaction
  try {
    const [newComment, _updatedTicket] = await prisma.$transaction([
      // Create the new comment
      prisma.ticketComment.create({
        data: {
          content: content,
          ticketId: ticket.id,
          userId: user.id,
          sender: CommentSender.CLIENT, // Comment is from the client
        },
        // Include user details in the response for immediate display
        include: {
          user: {
            select: { name: true, id: true },
          },
        },
      }),
      // Update the ticket's lastRepliedAt and potentially status
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          lastRepliedAt: new Date(),
          // If admin replies, status might change to PENDING,
          // if client replies, status might change from PENDING back to OPEN
          // For now, if client replies, ensure it's not stuck in PENDING
          status:
            ticket.status === TicketStatus.PENDING
              ? TicketStatus.OPEN
              : ticket.status,
        },
      }),
    ]);

    return { success: true, comment: newComment };
  } catch (dbError) {
    console.error("Prisma Error creating comment or updating ticket:", dbError);
    throw createError({
      statusCode: 500,
      statusMessage: "Server Error: Could not add comment",
    });
  }
});
