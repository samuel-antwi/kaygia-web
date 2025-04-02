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

    // Get message ID from route
    const messageId = getRouterParam(event, "id");
    if (!messageId) {
      return {
        success: false,
        error: "Message ID is required",
        statusCode: 400,
      };
    }

    // Find the message
    const message = await prisma.contactMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return {
        success: false,
        error: "Message not found",
        statusCode: 404,
      };
    }

    // Check if the message belongs to the user
    if (message.email !== user.email) {
      return {
        success: false,
        error: "Unauthorized access to message",
        statusCode: 403,
      };
    }

    // Update the message to mark it as read
    const updatedMessage = await prisma.contactMessage.update({
      where: {
        id: messageId,
      },
      data: {
        isRead: true,
      },
    });

    // Close Prisma connection
    await prisma.$disconnect();

    // Return success with updated message
    return {
      success: true,
      message: updatedMessage,
    };
  } catch (error: any) {
    console.error("Error marking message as read:", error);

    return {
      success: false,
      error: error.message || "An error occurred while marking message as read",
      statusCode: 500,
    };
  }
});
