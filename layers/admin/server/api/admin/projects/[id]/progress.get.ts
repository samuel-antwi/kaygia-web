import { defineEventHandler, getRouterParam, createError } from "h3";
import { getDb } from "../../../../../../../server/utils/db";
import { projectMilestones, projects } from "../../../../../../../server/db/schema";
import { eq, asc } from "drizzle-orm";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";
import { 
  getProjectPhases, 
  calculatePhaseProgress, 
  calculateOverallProgressByPhases,
  getCurrentPhaseFromProgress 
} from "../../../../../../../server/utils/project-phases-dynamic";

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

    // Fetch project with basic info including type and phase template
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      columns: {
        id: true,
        title: true,
        status: true,
        progress: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        type: true,
        phaseTemplate: true,
      },
    });

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found: Project does not exist.",
      });
    }

    // Fetch milestones ordered by phase order first, then milestone order
    let milestones: any[] = [];
    try {
      milestones = await db.query.projectMilestones.findMany({
        where: eq(projectMilestones.projectId, id),
        orderBy: [
          asc(projectMilestones.phaseOrder),
          asc(projectMilestones.order)
        ],
      });
    } catch (error: any) {
      // Handle case where project_milestones table doesn't exist yet
      if (
        error.message?.includes('relation "project_milestones" does not exist')
      ) {
        console.warn(
          "Project milestones table does not exist yet. Run database migrations."
        );
        milestones = [];
      } else {
        throw error;
      }
    }

    // Get dynamic phases based on project type and template
    const phases = await getProjectPhases(project.type, project.phaseTemplate);
    
    // Calculate phase-specific progress
    const phaseProgress: Record<string, { progress: number; milestones: any[] }> = {};
    const phaseProgressPercent: Record<string, number> = {};
    
    Object.values(phases).forEach((phase: any) => {
      const phaseMilestones = milestones.filter(m => m.phase === phase.id);
      const progress = calculatePhaseProgress(phaseMilestones);
      
      phaseProgress[phase.id] = {
        progress,
        milestones: phaseMilestones
      };
      phaseProgressPercent[phase.id] = progress;
    });
    
    // Calculate overall progress based on phase completion
    const calculatedProgress = calculateOverallProgressByPhases(phases, phaseProgressPercent);
    
    // Get current phase
    const currentPhaseInfo = getCurrentPhaseFromProgress(phases, phaseProgressPercent);
    const currentPhase = currentPhaseInfo?.id || Object.keys(phases)[0];

    // Calculate progress statistics
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(
      (m) => m.status === "completed"
    ).length;
    const inProgressMilestones = milestones.filter(
      (m) => m.status === "in_progress"
    ).length;
    const pendingMilestones = milestones.filter(
      (m) => m.status === "pending"
    ).length;

    return {
      success: true,
      project: {
        ...project,
        calculatedProgress, // New hybrid progress
        currentPhase,
      },
      milestones,
      phases,
      phaseProgress,
      progress: {
        total: totalMilestones,
        completed: completedMilestones,
        inProgress: inProgressMilestones,
        pending: pendingMilestones,
        overallProgress: calculatedProgress,
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
