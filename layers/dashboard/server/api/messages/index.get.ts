import prisma from "../../../../../server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    // Check user authentication
    const session = await getUserSession(event);
    if (!session || !session.user?.email) {
      return {
        success: false,
        error: "Authentication required",
        statusCode: 401,
      };
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    // Fetch client messages for the user
    const messages = await prisma.clientMessage.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Return success with messages
    return {
      success: true,
      messages: messages.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
      })),
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
