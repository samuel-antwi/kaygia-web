import { defineEventHandler, getRouterParam, createError } from "h3";
import { getDb } from "../../../../../../../../server/utils/db";
import { projectMilestones, projects } from "../../../../../../../../server/db/schema";
import { eq, and } from "drizzle-orm";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

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

    // Delete milestone
    await db
      .delete(projectMilestones)
      .where(eq(projectMilestones.id, milestoneId));

    return {
      success: true,
      message: "Milestone deleted successfully",
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error deleting milestone ${milestoneId}:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not delete milestone.",
      data: error.message,
    });
  }
});