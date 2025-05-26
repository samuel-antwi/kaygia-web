import { defineEventHandler, getRouterParam } from "h3";
import { getDb } from "../../../../../../../server/utils/db";
import { projects, projectComments, users } from "../../../../../../../server/db/schema";
import { and, eq, desc, isNull } from "drizzle-orm";

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

    // Get project comments (only top-level comments, replies are nested)
    const comments = await db.query.projectComments.findMany({
      where: and(
        eq(projectComments.projectId, projectId),
        isNull(projectComments.parentId) // Only top-level comments
      ),
      orderBy: [desc(projectComments.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: [desc(projectComments.createdAt)],
        },
      },
    });

    return {
      success: true,
      comments: comments.map(comment => ({
        id: comment.id,
        message: comment.message,
        type: comment.type,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: comment.user,
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          message: reply.message,
          type: reply.type,
          createdAt: reply.createdAt,
          updatedAt: reply.updatedAt,
          user: reply.user,
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching project comments:", error);
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error instanceof Error ? error.message : "Failed to fetch project comments" 
    });
  }
});