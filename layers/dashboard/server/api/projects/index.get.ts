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

    // Fetch projects for user
    const projects = await prisma.project.findMany({
      where: {
        clientId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Close Prisma connection
    await prisma.$disconnect();

    // Return success with projects
    return {
      success: true,
      projects,
    };
  } catch (error: any) {
    console.error("Error fetching projects:", error);

    return {
      success: false,
      error: error.message || "An error occurred while fetching projects",
      statusCode: 500,
    };
  }
});
