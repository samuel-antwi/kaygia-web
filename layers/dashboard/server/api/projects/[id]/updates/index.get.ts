import { defineEventHandler, getRouterParam } from "h3";
import { getDb } from "../../../../../../../server/utils/db";
import { projects, projectUpdates, users } from "../../../../../../../server/db/schema";
import { and, eq, desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, "id");
    if (!projectId) {
      throw createError({ statusCode: 400, statusMessage: "Project ID is required" });
    }

    // Get the user session
    const session = await getUserSession(event);
    if (!session?.user) {
      throw createError({ statusCode: 401, statusMessage: "Authentication required" });
    }

    // Initialize database connection
    const db = getDb(event);

    // Get the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      columns: { id: true },
    });

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Verify project exists and user has access
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), eq(projects.clientId, user.id)),
    });

    if (!project) {
      throw createError({ statusCode: 404, statusMessage: "Project not found" });
    }

    // Get project updates
    const updates = await db.query.projectUpdates.findMany({
      where: eq(projectUpdates.projectId, projectId),
      orderBy: [desc(projectUpdates.createdAt)],
      limit: 50, // Limit to last 50 updates
    });

    return {
      success: true,
      updates: updates.map(update => ({
        id: update.id,
        message: update.message,
        type: update.type,
        author: update.author,
        authorRole: update.authorRole,
        createdAt: update.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching project updates:", error);
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error instanceof Error ? error.message : "Failed to fetch project updates" 
    });
  }
});