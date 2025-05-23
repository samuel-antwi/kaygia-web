import { defineEventHandler } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, users, projectMilestones } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { calculateOverallProgress, getCurrentPhase, PROJECT_PHASES } from "~/server/utils/project-phases";

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

    // Fetch project milestones to calculate hybrid progress
    const milestones = await db.query.projectMilestones.findMany({
      where: eq(projectMilestones.projectId, projectId),
    });

    // Calculate hybrid progress
    const calculatedProgress = calculateOverallProgress(milestones, project.status);
    const currentPhase = getCurrentPhase(milestones) || 'discovery'; // Default to discovery if no milestones
    
    // Get current phase details
    const currentPhaseDetails = currentPhase ? PROJECT_PHASES[Object.keys(PROJECT_PHASES).find(
      key => PROJECT_PHASES[key as keyof typeof PROJECT_PHASES].id === currentPhase
    ) as keyof typeof PROJECT_PHASES] : null;

    return {
      success: true,
      project: {
        ...project,
        progress: project.progress || calculatedProgress, // Use stored progress or calculated
        currentPhase,
        currentPhaseName: currentPhaseDetails?.name || null,
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
