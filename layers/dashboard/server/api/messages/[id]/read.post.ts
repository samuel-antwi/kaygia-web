import prisma from "../../../../../../server/utils/prisma";

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
    const message = await prisma.clientMessage.findUnique({
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
    if (message.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized access to message",
        statusCode: 403,
      };
    }

    // Update the message to mark it as read
    const updatedMessage = await prisma.clientMessage.update({
      where: {
        id: messageId,
      },
      data: {
        isRead: true,
      },
    });

    // Return success with updated message
    return {
      success: true,
      message: {
        ...updatedMessage,
        createdAt: updatedMessage.createdAt.toISOString(),
      },
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
