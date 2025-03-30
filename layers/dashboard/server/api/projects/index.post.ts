import { PrismaClient } from "@prisma/client";
import type { CreateProjectPayload } from "../../../types/project";

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
      await prisma.$disconnect();
      return {
        success: false,
        error: "User not found",
        statusCode: 404,
      };
    }

    // Parse the request body
    const body = await readBody<CreateProjectPayload>(event);

    // Validate required fields
    if (!body.title || !body.type) {
      await prisma.$disconnect();
      return {
        success: false,
        error: "Title and project type are required",
        statusCode: 400,
      };
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type,
        status: "PENDING", // Default status for new projects
        clientId: user.id,
        budget: body.budget || null,
        requirements: body.requirements || null,
      },
    });

    // Close Prisma connection
    await prisma.$disconnect();

    // Return success with the created project
    return {
      success: true,
      project,
    };
  } catch (error: any) {
    console.error("Error creating project:", error);

    return {
      success: false,
      error: error.message || "An error occurred while creating the project",
      statusCode: 500,
    };
  }
});
