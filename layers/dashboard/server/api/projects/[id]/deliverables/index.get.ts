import { defineEventHandler, getRouterParam } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, projectDeliverables, projectFiles, users } from "~/server/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getPublicUrl, STORAGE_BUCKETS } from "~/server/utils/storage";

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
        fileUrl = getPublicUrl(STORAGE_BUCKETS.PROJECT_FILES, (deliverable.file as any).path);
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
          id: (deliverable.file as any).id,
          name: (deliverable.file as any).name,
          originalName: (deliverable.file as any).originalName,
          size: (deliverable.file as any).size,
          mimeType: (deliverable.file as any).mimeType,
        } : null,
      };
    });

    return {
      success: true,
      deliverables: formattedDeliverables,
    };
  } catch (error: any) {
    console.error("Error fetching project deliverables:", error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || "Failed to fetch project deliverables" 
    });
  }
});