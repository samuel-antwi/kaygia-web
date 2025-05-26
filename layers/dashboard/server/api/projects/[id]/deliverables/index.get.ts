import { defineEventHandler, getRouterParam } from "h3";
import { getDb } from "../../../../../../../server/utils/db";
import { projects, projectDeliverables, projectFiles, users } from "../../../../../../../server/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getPublicUrl, STORAGE_BUCKETS } from "../../../../../../../server/utils/storage";

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

    // Get project deliverables with file information
    const deliverables = await db.query.projectDeliverables.findMany({
      where: eq(projectDeliverables.projectId, projectId),
      orderBy: [desc(projectDeliverables.createdAt)],
      with: {
        file: true,
        approvedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Format deliverables with URLs
    const formattedDeliverables = deliverables.map(deliverable => {
      let fileUrl = null;
      
      if (deliverable.type === 'file' && deliverable.file) {
        fileUrl = getPublicUrl(STORAGE_BUCKETS.PROJECT_FILES, deliverable.file.path);
      } else if (deliverable.type === 'link' || deliverable.type === 'preview') {
        fileUrl = deliverable.url;
      }

      return {
        id: deliverable.id,
        name: deliverable.name,
        description: deliverable.description,
        type: deliverable.type,
        fileType: deliverable.fileType,
        status: deliverable.status,
        url: fileUrl,
        createdAt: deliverable.createdAt,
        approvedAt: deliverable.approvedAt,
        approvedBy: deliverable.approvedBy,
        file: deliverable.file ? {
          id: deliverable.file.id,
          name: deliverable.file.name,
          originalName: deliverable.file.originalName,
          size: deliverable.file.size,
          mimeType: deliverable.file.mimeType,
        } : null,
      };
    });

    return {
      success: true,
      deliverables: formattedDeliverables,
    };
  } catch (error) {
    console.error("Error fetching project deliverables:", error);
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error instanceof Error ? error.message : "Failed to fetch project deliverables" 
    });
  }
});