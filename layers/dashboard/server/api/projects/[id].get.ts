import { defineEventHandler } from "h3";
import { getDb } from "../../../../../server/utils/db";
import { projects, users, projectMilestones } from "../../../../../server/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { 
  getProjectPhases, 
  calculatePhaseProgress, 
  calculateOverallProgressByPhases,
  getCurrentPhaseFromProgress 
} from "../../../../../server/utils/project-phases-dynamic";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const projectId = event.context.params?.id;
  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Project ID is required",
    });
  }

  const db = getDb(event);

  try {
    // First get the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Then get their project with security check
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.clientId, user.id)),
    });

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: "Project not found",
      });
    }

    // Fetch project milestones ordered by phase and milestone order
    const milestones = await db.query.projectMilestones.findMany({
      where: eq(projectMilestones.projectId, projectId),
      orderBy: [
        asc(projectMilestones.phaseOrder),
        asc(projectMilestones.order)
      ],
    });

    // Get dynamic phases based on project type and template
    const phases = await getProjectPhases(project.type, project.phaseTemplate);
    
    // Calculate phase-specific progress
    const phaseProgress: Record<string, number> = {};
    const phasesWithMilestones: Array<{
      id: string;
      name: string;
      order: number;
      progress: number;
      milestones: any[];
      isComplete: boolean;
    }> = [];
    
    Object.values(phases).forEach((phase: any) => {
      const phaseMilestones = milestones.filter(m => m.phase === phase.id);
      const progress = calculatePhaseProgress(phaseMilestones);
      phaseProgress[phase.id] = progress;
      
      phasesWithMilestones.push({
        id: phase.id,
        name: phase.name,
        order: phase.order,
        progress,
        milestones: phaseMilestones.map(m => ({
          id: m.id,
          name: m.name,
          status: m.status,
          description: m.description || undefined
        })),
        isComplete: phaseMilestones.length > 0 && phaseMilestones.every(m => m.status === 'completed')
      });
    });
    
    // Sort phases by order
    phasesWithMilestones.sort((a, b) => a.order - b.order);
    
    // Calculate overall progress
    const calculatedProgress = calculateOverallProgressByPhases(phases, phaseProgress);
    
    // Get current phase
    const currentPhaseInfo = getCurrentPhaseFromProgress(phases, phaseProgress);

    return {
      success: true,
      project: {
        ...project,
        progress: calculatedProgress,
        currentPhase: currentPhaseInfo?.id || null,
        currentPhaseName: currentPhaseInfo?.name || null,
        phases: phasesWithMilestones, // Include phase details for client display
      },
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch project",
    });
  }
});
