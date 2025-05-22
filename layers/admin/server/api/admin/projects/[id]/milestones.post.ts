import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projectMilestones, projects } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";
import { randomUUID } from "crypto";

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

  if (!body || !body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Name is required",
    });
  }

  // Valid milestone statuses
  const validStatuses = ["pending", "in_progress", "completed"];

  if (body.status && !validStatuses.includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Bad Request: Status must be one of: ${validStatuses.join(", ")}`,
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

    // Create new milestone
    const milestoneId = randomUUID();
    await db.insert(projectMilestones).values({
      id: milestoneId,
      projectId: id,
      name: body.name,
      description: body.description || null,
      targetDate: body.targetDate ? new Date(body.targetDate) : null,
      status: body.status || "pending",
      order: body.order || 0,
    });

    // Fetch the created milestone
    const newMilestone = await db.query.projectMilestones.findFirst({
      where: eq(projectMilestones.id, milestoneId),
    });

    return {
      success: true,
      message: "Milestone created successfully",
      milestone: newMilestone,
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error creating project ${id} milestone:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not create milestone.",
      data: error.message,
    });
  }
});