import { defineEventHandler, getRouterParam, setHeader } from "h3";
import { getDb } from "~/server/utils/db";
import { projects, projectFiles, users } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getSignedUrl, STORAGE_BUCKETS } from "~/server/utils/storage";

export default defineEventHandler(async (event) => {
  try {
    const projectId = getRouterParam(event, "id");
    const fileId = getRouterParam(event, "fileId");
    
    if (!projectId || !fileId) {
      throw createError({ statusCode: 400, statusMessage: "Project ID and File ID are required" });
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

    // Get the file
    const file = await db.query.projectFiles.findFirst({
      where: and(eq(projectFiles.id, fileId), eq(projectFiles.projectId, projectId)),
    });

    if (!file) {
      throw createError({ statusCode: 404, statusMessage: "File not found" });
    }

    // Generate signed URL for secure download (expires in 1 hour)
    const signedUrl = await getSignedUrl(
      STORAGE_BUCKETS.PROJECT_FILES,
      file.path,
      3600 // 1 hour
    );

    // For direct download, redirect to the signed URL
    // Alternatively, you could proxy the file through your server
    return await sendRedirect(event, signedUrl);

  } catch (error: any) {
    console.error("Error downloading file:", error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({ 
      statusCode: 500, 
      statusMessage: error.message || "Failed to download file" 
    });
  }
});