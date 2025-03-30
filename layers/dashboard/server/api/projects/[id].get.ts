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

    // Get project ID from URL
    const id = getRouterParam(event, "id");
    if (!id) {
      return {
        success: false,
        error: "Project ID is required",
        statusCode: 400,
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
      await prisma.$disconnect();
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    // Fetch the specific project
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    // Close Prisma connection
    await prisma.$disconnect();

    // Check if project exists
    if (!project) {
      return {
        success: false,
        error: "Project not found",
        statusCode: 404,
      };
    }

    // Verify user is the project owner or admin
    if (project.clientId !== user.id) {
      return {
        success: false,
        error: "You do not have permission to view this project",
        statusCode: 403,
      };
    }

    // Return success with project
    return {
      success: true,
      project,
    };
  } catch (error: any) {
    console.error("Error fetching project:", error);

    return {
      success: false,
      error: error.message || "An error occurred while fetching the project",
      statusCode: 500,
    };
  }
});
