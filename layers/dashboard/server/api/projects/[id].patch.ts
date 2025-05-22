import { defineEventHandler, getRouterParam } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Define the validation schema for project updates
const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z
    .enum([
      "WEBSITE",
      "E_COMMERCE",
      "WEB_APP",
      "LANDING_PAGE",
    ])
    .optional(),
  status: z
    .enum([
      "PENDING",
      "APPROVED",
      "IN_PROGRESS",
      "REVIEW",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  requirements: z.string().optional(),
  budget: z.number().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, "id");
    if (!projectId) {
      return {
        success: false,
        message: "Project ID is required",
      };
    }

    // Get the user session
    const session = await getUserSession(event);
    if (!session?.user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    // Get request body
    const body = await readBody(event);

    // Validate the request body
    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      return {
        success: false,
        message: "Invalid project data",
        errors: validation.error.errors,
      };
    }

    // Initialize database connection
    const db = getDb(event);

    // First get the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Check if project exists and belongs to user
    const existingProject = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.clientId, user.id)),
    });

    if (!existingProject) {
      throw createError({
        statusCode: 404,
        statusMessage: "Project not found",
      });
    }

    // Extract date fields and other data separately
    const { startDate, endDate, ...otherData } = validation.data;

    // Prepare update data with proper date types
    const updateData = {
      ...otherData,
      updatedAt: new Date(),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    };

    // Update the project
    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    return {
      success: true,
      project: updatedProject,
    };
  } catch (error: any) {
    console.error("Error updating project:", error);
    return {
      success: false,
      message: error.message || "Failed to update project",
    };
  }
});
