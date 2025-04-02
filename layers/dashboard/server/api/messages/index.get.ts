import { PrismaClient } from "@prisma/client";

export default defineEventHandler(async (event) => {
  try {
    // Check user authentication
    const session = await getUserSession(event);
    if (!session) {
      return {
        success: false,
        error: "Authentication required",
        statusCode: 401,
      };
    }

    const prisma = new PrismaClient();

    // Get user from session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    // Fetch contact messages that match the user's email
    const messages = await prisma.contactMessage.findMany({
      where: {
        email: user.email,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Close Prisma connection
    await prisma.$disconnect();

    // Return success with messages
    return {
      success: true,
      messages,
    };
  } catch (error: any) {
    console.error("Error fetching messages:", error);

    return {
      success: false,
      error: error.message || "An error occurred while fetching messages",
      statusCode: 500,
    };
  }
});
