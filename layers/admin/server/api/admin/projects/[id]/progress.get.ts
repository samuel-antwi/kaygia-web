import { defineEventHandler, getRouterParam, createError } from "h3";
import { getDb } from "~/server/utils/db";
import { projectMilestones, projects } from "~/server/db/schema";
import { eq, asc } from "drizzle-orm";
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

  try {
    const db = getDb(event);

    // Fetch project with basic info
    const project = await db.query.projects.findFirst({
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

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Project does not exist.",
      });
    }

    // Fetch milestones ordered by their order field
    const milestones = await db.query.projectMilestones.findMany({
      where: eq(projectMilestones.projectId, id),
      orderBy: [asc(projectMilestones.order)],
    });

    // Calculate progress statistics
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const inProgressMilestones = milestones.filter(m => m.status === 'in_progress').length;
    const pendingMilestones = milestones.filter(m => m.status === 'pending').length;
    
    const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return {
      success: true,
      project,
      milestones,
      progress: {
        total: totalMilestones,
        completed: completedMilestones,
        inProgress: inProgressMilestones,
        pending: pendingMilestones,
        overallProgress,
      },
    };
  } catch (error: any) {
    console.error(`[API][Admin] Error fetching project ${id} progress:`, error);

    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error: Could not fetch project progress.",
      data: error.message,
    });
  }
});