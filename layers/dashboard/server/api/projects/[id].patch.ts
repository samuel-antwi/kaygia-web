import { PrismaClient } from "@prisma/client";
import type { UpdateProjectPayload } from "../../../types/project";

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

    // First check if the project exists and user has permission
    const existingProject = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!existingProject) {
      await prisma.$disconnect();
      return {
        success: false,
        error: "Project not found",
        statusCode: 404,
      };
    }

    // Verify user is the project owner or admin
    if (existingProject.clientId !== user.id) {
      await prisma.$disconnect();
      return {
        success: false,
        error: "You do not have permission to update this project",
        statusCode: 403,
      };
    }

    // Parse the request body
    const body = await readBody<UpdateProjectPayload>(event);

    // Update the project
    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description:
          body.description !== undefined ? body.description : undefined,
        status: body.status !== undefined ? body.status : undefined,
        startDate: body.startDate !== undefined ? body.startDate : undefined,
        endDate: body.endDate !== undefined ? body.endDate : undefined,
        budget: body.budget !== undefined ? body.budget : undefined,
        requirements:
          body.requirements !== undefined ? body.requirements : undefined,
        updatedAt: new Date(), // Update the timestamp
      },
    });

    // Close Prisma connection
    await prisma.$disconnect();

    // Return success with the updated project
    return {
      success: true,
      project,
    };
  } catch (error: any) {
    console.error("Error updating project:", error);

    return {
      success: false,
      error: error.message || "An error occurred while updating the project",
      statusCode: 500,
    };
  }
});
