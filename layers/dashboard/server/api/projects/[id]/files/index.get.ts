import { defineEventHandler, getRouterParam } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, projectFiles, users } from "~/server/db/schema";
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

    // Get all files for this project
    const files = await db.query.projectFiles.findMany({
      where: eq(projectFiles.projectId, projectId),
      orderBy: [desc(projectFiles.createdAt)],
      with: {
        uploadedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Add public URLs to files
    const filesWithUrls = files.map(file => ({
      id: file.id,
      name: file.name,
      originalName: file.originalName,
      type: file.type,
      mimeType: file.mimeType,
      size: file.size,
      createdAt: file.createdAt,
      uploadedBy: file.uploadedBy,
      url: getPublicUrl(STORAGE_BUCKETS.PROJECT_FILES, file.path),
      // Don't expose the internal storage path to clients
    }));

    return {
      success: true,
      files: filesWithUrls,
    };
  } catch (error: any) {
    console.error("Error fetching project files:", error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || "Failed to fetch project files" 
    });
  }
});