import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { getDb } from "../../../../../../../server/utils/db";
import { projects, projectStatusEnum } from "../../../../../../../server/db/schema";
import { eq } from "drizzle-orm";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

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

  if (!body || !body.status) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Status is required in request body",
    });
  }

  // Valid project statuses
  const validStatuses = [
    "PENDING",
    "APPROVED",
    "IN_PROGRESS",
    "REVIEW",
    "COMPLETED",
    "CANCELLED",
  ];

  if (!validStatuses.includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bad Request: Status must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    const db = getDb(event);

    // Check if project exists
    const existingProject = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!existingProject) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Project does not exist.",
      });
    }

    // Update project status
    await db
      .update(projects)
      .set({
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    // Fetch the updated project
    const updatedProject = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        client: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Project status updated to ${body.status}`,
      project: updatedProject,
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error updating project ${id} status:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not update project status.",
      data: error.message,
    });
  }
});
