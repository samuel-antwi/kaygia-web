import { prisma } from "../../../../../server/utils/prisma";

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

    // Get request body
    const body = await readBody(event);

    // Validate required fields
    if (!body.subject || !body.content) {
      return {
        success: false,
        error: "Subject and content are required",
        statusCode: 400,
      };
    }

    // Create a new message
    const message = await prisma.clientMessage.create({
      data: {
        subject: body.subject,
        content: body.content,
        userId: user.id,
        sender: "CLIENT",
      },
    });

    // Return success with the created message
    return {
      success: true,
      message: {
        ...message,
        createdAt: message.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error sending message:", error);

    return {
      success: false,
      error: error.message || "An error occurred while sending the message",
      statusCode: 500,
    };
  }
});
