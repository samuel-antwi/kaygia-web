import { defineEventHandler, getRouterParam, readBody } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, projectComments, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Validation schema
const commentSchema = z.object({
  message: z.string().min(1, "Message is required").max(1000, "Message too long"),
  type: z.enum(["comment", "feedback", "question"]).default("comment"),
  parentId: z.string().uuid().optional(), // For replies
});

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

    // Validate request body
    const body = await readBody(event);
    const validation = commentSchema.safeParse(body);
    
    if (!validation.success) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: "Invalid comment data",
        data: validation.error.errors 
      });
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

    // If this is a reply, verify parent comment exists
    if (validation.data.parentId) {
      const parentComment = await db.query.projectComments.findFirst({
        where: and(
          eq(projectComments.id, validation.data.parentId),
          eq(projectComments.projectId, projectId)
        ),
      });

      if (!parentComment) {
        throw createError({ statusCode: 404, statusMessage: "Parent comment not found" });
      }
    }

    // Create the comment
    const commentId = uuidv4();
    const [newComment] = await db
      .insert(projectComments)
      .values({
        id: commentId,
        projectId: projectId,
        userId: user.id,
        message: validation.data.message,
        type: validation.data.type,
        parentId: validation.data.parentId || null,
      })
      .returning();

    // Get the comment with user information
    const commentWithUser = await db.query.projectComments.findFirst({
      where: eq(projectComments.id, commentId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Here you could add logic to:
    // - Send notification to project team
    // - Create project update entry
    // - Send email notifications

    return {
      success: true,
      comment: {
        id: commentWithUser!.id,
        message: commentWithUser!.message,
        type: commentWithUser!.type,
        createdAt: commentWithUser!.createdAt,
        updatedAt: commentWithUser!.updatedAt,
        user: commentWithUser!.user,
      },
      message: "Comment added successfully",
    };
  } catch (error: any) {
    console.error("Error creating project comment:", error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || "Failed to create comment" 
    });
  }
});