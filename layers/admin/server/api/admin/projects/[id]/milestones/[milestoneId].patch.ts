import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projectMilestones, projects } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { hasAdminAccess } from "~/layers/admin/utils/adminAccess";

export default defineEventHandler(async (event) => {
  // Get project ID and milestone ID from params
  const projectId = getRouterParam(event, "id");
  const milestoneId = getRouterParam(event, "milestoneId");

  if (!projectId || !milestoneId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: Project ID and Milestone ID are required",
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
      where: eq(projects.id, projectId),
    });

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Project does not exist.",
      });
    }

    // Verify milestone exists and belongs to the project
    const milestone = await db.query.projectMilestones.findFirst({
      where: and(
        eq(projectMilestones.id, milestoneId),
        eq(projectMilestones.projectId, projectId)
      ),
    });

    if (!milestone) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Milestone does not exist.",
      });
    }

    // Prepare update object with only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.targetDate !== undefined) {
      updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
      
      // Set completedAt when status changes to completed
      if (body.status === "completed" && milestone.status !== "completed") {
        updateData.completedAt = new Date();
      } else if (body.status !== "completed") {
        updateData.completedAt = null;
      }
    }

    if (body.order !== undefined) {
      updateData.order = body.order;
    }

    // Update milestone
    await db
      .update(projectMilestones)
      .set(updateData)
      .where(eq(projectMilestones.id, milestoneId));

    // Fetch updated milestone
    const updatedMilestone = await db.query.projectMilestones.findFirst({
      where: eq(projectMilestones.id, milestoneId),
    });

    return {
      success: true,
      message: "Milestone updated successfully",
      milestone: updatedMilestone,
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error updating milestone ${milestoneId}:`, error);

    if (error.statusCode === 404 || error.statusCode === 400) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not update milestone.",
      data: error.message,
    });
  }
});