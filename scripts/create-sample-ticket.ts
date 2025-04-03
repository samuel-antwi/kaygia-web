import { PrismaClient, TicketStatus, CommentSender } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const targetUserId = "cm8thak9x000dc9vmsmv805mm"; // Target specific user
  console.log(`Attempting to find user with ID: ${targetUserId}`);

  // Find the specific user by ID
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    console.error(
      `User with ID ${targetUserId} not found. Cannot create sample ticket.`
    );
    return;
  }

  console.log(`Found user: ${user.email} (ID: ${user.id})`);

  // Create a sample support ticket and initial admin comment in a transaction
  try {
    const newTicket = await prisma.$transaction(async (tx) => {
      console.log("Creating sample ticket...");
      const ticket = await tx.supportTicket.create({
        data: {
          subject: "Welcome to Kaygia Support!",
          clientId: user.id,
          status: TicketStatus.OPEN,
        },
      });
      console.log("Ticket created, ID:", ticket.id);

      console.log("Creating initial admin comment...");
      await tx.ticketComment.create({
        data: {
          content:
            "Welcome! Feel free to reply here with any questions you have about your project.",
          ticketId: ticket.id,
          userId: user.id, // Track who the comment is FOR (client), even if ADMIN sent it
          sender: CommentSender.ADMIN,
        },
      });
      console.log("Admin comment created.");

      // Update the ticket's lastRepliedAt after comment creation
      // Note: The DB default might handle this, but explicit update ensures it
      const updatedTicket = await tx.supportTicket.update({
        where: { id: ticket.id },
        data: { lastRepliedAt: new Date() },
      });
      console.log("Ticket lastRepliedAt updated.");

      return updatedTicket; // Return the final ticket state from transaction
    });

    console.log("\nSuccessfully created sample ticket:");
    console.log(`  ID: ${newTicket.id}`);
    console.log(`  Subject: ${newTicket.subject}`);
    console.log(`  Status: ${newTicket.status}`);
    console.log(`  Client: ${user.email}`);
    console.log(`  Created At: ${newTicket.createdAt}`);
    console.log(`  Last Replied At: ${newTicket.lastRepliedAt}`);
  } catch (error) {
    console.error("\nError creating sample ticket:", error);
    throw error; // Re-throw to be caught by the main catch block
  }
}

main()
  .then(async () => {
    console.log("\nDisconnecting Prisma Client...");
    await prisma.$disconnect();
    console.log("Disconnected.");
  })
  .catch(async (e) => {
    console.error("\nScript failed:", e);
    await prisma.$disconnect();
    console.log("Disconnected after error.");
    process.exit(1);
  });
