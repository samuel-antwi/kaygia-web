async function main() {
  const targetUserId = "cm8thak9x000dc9vmsmv805mm"; // Target specific user

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

  // Create a sample support ticket and initial admin comment in a transaction
  try {
    const newTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          subject: "Welcome to Kaygia Support!",
          clientId: user.id,
          status: "OPEN",
        },
      });

      await tx.ticketComment.create({
        data: {
          content:
            "Welcome! Feel free to reply here with any questions you have about your project.",
          ticketId: ticket.id,
          userId: user.id, // Track who the comment is FOR (client), even if ADMIN sent it
          sender: "ADMIN",
        },
      });

      // Update the ticket's lastRepliedAt after comment creation
      // Note: The DB default might handle this, but explicit update ensures it
      const updatedTicket = await tx.supportTicket.update({
        where: { id: ticket.id },
        data: { lastRepliedAt: new Date() },
      });

      return updatedTicket; // Return the final ticket state from transaction
    });
  } catch (error) {
    console.error("\nError creating sample ticket:", error);
    throw error; // Re-throw to be caught by the main catch block
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("\nScript failed:", e);
    await prisma.$disconnect();

    process.exit(1);
  });
