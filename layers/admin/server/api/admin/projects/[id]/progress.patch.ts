import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  // Get project ID from params
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Project ID is required",
    });
  }

  // Get the user session
  const session = await getUserSession(event);
  const user = session?.user;

  // Verify admin role
  if (!user || !hasAdminAccess(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Admin access required.",
    });
  }

  // Get request body
  const body = await readBody(event);

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Request body is required",
    });
  }

  try {
    const db = getDb(event);

    // Verify project exists
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Project does not exist.",
      });
    }

    // Prepare update object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Allow updating specific project progress fields
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    if (body.status !== undefined) {
      const validStatuses = ["PENDING", "APPROVED", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"];
      if (!validStatuses.includes(body.status)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Bad Request: Status must be one of: ${validStatuses.join(", ")}`,
        });
      }
      updateData.status = body.status;
    }

    // Update project
    await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id));

    // Fetch updated project
    const updatedProject = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      columns: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: "Project progress updated successfully",
      project: updatedProject,
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error updating project ${id} progress:`, error);

    if (error.statusCode === 404 || error.statusCode === 400) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not update project progress.",
      data: error.message,
    });
  }
});